"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * A little 3D ghost that reads the page along with the visitor.
 *
 * The ghost is built procedurally (sheet-ghost body with a waving hem,
 * stubby arms) and its face is drawn each frame onto a canvas texture, so
 * expressions can morph smoothly. As you scroll it drifts across the
 * viewport — right, then left, section to section, like eyes tracking a
 * page — and its expression follows the section it is "reading":
 *
 *   01 about       warm smile
 *   02 experience  impressed "ooh"
 *   03 projects    delighted (^‿^)
 *   04 skills      squinting, studying hard
 *   05 contact     wink + waving arm
 *
 * Its pupils saccade side-to-side like it's reading, it blinks on a
 * random timer, and it leans into its own movement. Desktop only.
 */

const SECTION_IDS = ["about", "experience", "projects", "skills", "contact"];

// per-section vertical position, as a viewport fraction
const STOP_Y = [0.24, 0.32, 0.22, 0.34, 0.4];

// which lane the ghost parks in while reading each section:
// "right" = the margin just right of that section's text block,
// "rail"  = the circuit-rail strip left of the text.
// It stays on the rail from experience through skills so it doesn't
// criss-cross the text in the middle of the page.
const LANES: ("right" | "rail")[] = ["right", "rail", "rail", "rail", "right"];

type Expr = {
  eyeOpen: number; // 0 closed .. ~1.2 wide
  eyeHappy: number; // 0 round .. 1 upturned arc
  eyeScale: number; // eye size multiplier
  browRaise: number; // 0 none .. 1 high
  mouthCurve: number; // -1 sad .. 1 smile
  mouthOpen: number; // 0 line .. 1 wide open
  mouthWide: number; // width multiplier
  wink: number; // 0..1 closes the right eye
  blush: number; // 0..1 pink cheeks
};

const EXPRESSIONS: Expr[] = [
  // about — warm hello
  { eyeOpen: 1, eyeHappy: 0.25, eyeScale: 1, browRaise: 0.2, mouthCurve: 1, mouthOpen: 0.25, mouthWide: 1, wink: 0, blush: 0.7 },
  // experience — impressed "ooh"
  { eyeOpen: 1.2, eyeHappy: 0, eyeScale: 1.15, browRaise: 1, mouthCurve: 0.1, mouthOpen: 0.85, mouthWide: 0.55, wink: 0, blush: 0.3 },
  // projects — delighted
  { eyeOpen: 1, eyeHappy: 1, eyeScale: 1, browRaise: 0.4, mouthCurve: 1, mouthOpen: 0.8, mouthWide: 1.05, wink: 0, blush: 0.8 },
  // skills — studying hard
  { eyeOpen: 0.45, eyeHappy: 0, eyeScale: 0.9, browRaise: 0, mouthCurve: 0.15, mouthOpen: 0.05, mouthWide: 0.7, wink: 0, blush: 0 },
  // contact — wink, say hi!
  { eyeOpen: 1, eyeHappy: 0.15, eyeScale: 1, browRaise: 0.5, mouthCurve: 1, mouthOpen: 0.5, mouthWide: 1, wink: 1, blush: 1 },
];

type FaceState = Expr & { blink: number; lookX: number; lookY: number };

function drawFace(ctx: CanvasRenderingContext2D, e: FaceState) {
  const ink = "#241f35";
  ctx.clearRect(0, 0, 256, 256);

  const eyeY = 106 + e.lookY;
  const happy = Math.min(1, Math.max(0, e.eyeHappy));

  for (const [side, ex] of [
    [-1, 88],
    [1, 168],
  ] as const) {
    const x = ex + e.lookX;
    let open = Math.max(0, e.eyeOpen) * (1 - e.blink);
    if (side === 1) open *= 1 - e.wink;
    const w = 15 * e.eyeScale;

    // round eye, crossfaded against the happy arc
    if (happy < 0.98) {
      ctx.globalAlpha = 1 - happy;
      ctx.fillStyle = ink;
      ctx.beginPath();
      ctx.ellipse(x, eyeY, w, Math.max(2, w * 1.25 * open), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (happy > 0.02) {
      ctx.globalAlpha = happy;
      ctx.strokeStyle = ink;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(x, eyeY + 8, w + 2, Math.PI * 1.2, Math.PI * 1.8);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (e.browRaise > 0.05) {
      ctx.strokeStyle = ink;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.globalAlpha = Math.min(1, e.browRaise);
      ctx.beginPath();
      ctx.arc(x, eyeY - 4 - e.browRaise * 10, w + 4, Math.PI * 1.25, Math.PI * 1.75);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  if (e.blush > 0.03) {
    ctx.fillStyle = `rgba(233,183,193,${0.75 * e.blush})`;
    for (const bx of [66, 190]) {
      ctx.beginPath();
      ctx.ellipse(bx + e.lookX * 0.6, 142, 14, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // mouth: a stroked smile blended with an open, filled mouth
  const mx = 128 + e.lookX * 0.7;
  const my = 164;
  const mw = 26 * e.mouthWide;
  const curve = e.mouthCurve * 16;
  const openH = e.mouthOpen * 30;

  if (e.mouthOpen < 0.5) {
    ctx.globalAlpha = 1 - e.mouthOpen * 2;
    ctx.strokeStyle = ink;
    ctx.lineWidth = 6.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(mx - mw, my - curve * 0.35);
    ctx.quadraticCurveTo(mx, my + curve, mx + mw, my - curve * 0.35);
    ctx.stroke();
  }
  if (e.mouthOpen > 0.05) {
    ctx.globalAlpha = Math.min(1, e.mouthOpen * 2);
    ctx.fillStyle = ink;
    ctx.beginPath();
    ctx.moveTo(mx - mw, my);
    ctx.quadraticCurveTo(mx, my - curve * 0.4, mx + mw, my);
    ctx.quadraticCurveTo(mx, my + openH * 2 + curve * 0.4, mx - mw, my);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export default function Ghost3D({
  onOpenChat,
}: {
  onOpenChat?: () => void;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const mount = mountRef.current;
    if (!host || !mount) return;
    if (window.innerWidth < 1024) return; // desktop only, like the rail

    const W = 150;
    const H = 175;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 20);
    camera.position.set(0, 0, 5.2);

    scene.add(new THREE.AmbientLight(0xbcaee0, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(2, 3, 4);
    scene.add(key);
    const under = new THREE.PointLight(0x9a79e8, 12, 8);
    under.position.set(0, -1.6, 1.5);
    scene.add(under);

    const ghost = new THREE.Group();
    scene.add(ghost);

    // body: a sphere with its lower half stretched into a skirt;
    // the hem is re-waved every frame from the stored base positions
    const bodyGeo = new THREE.SphereGeometry(1, 48, 32);
    {
      const p = bodyGeo.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const y = p.getY(i);
        if (y < 0) p.setY(i, y * 1.45);
      }
    }
    const basePos = Float32Array.from(
      bodyGeo.attributes.position.array as Float32Array
    );
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf9f3e8,
      roughness: 0.55,
      metalness: 0,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    ghost.add(body);

    const armGeo = new THREE.SphereGeometry(1, 16, 12);
    const mkArm = (side: 1 | -1) => {
      const arm = new THREE.Mesh(armGeo, bodyMat);
      arm.scale.set(0.16, 0.38, 0.16);
      arm.position.set(side * 0.92, -0.15, 0.15);
      arm.rotation.z = side * -0.7;
      ghost.add(arm);
      return arm;
    };
    const armR = mkArm(1);
    const armL = mkArm(-1);

    const faceCanvas = document.createElement("canvas");
    faceCanvas.width = 256;
    faceCanvas.height = 256;
    const fctx = faceCanvas.getContext("2d")!;
    const faceTex = new THREE.CanvasTexture(faceCanvas);
    const faceGeo = new THREE.PlaneGeometry(1.5, 1.5);
    const faceMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
    });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.set(0, 0.12, 1.02);
    ghost.add(face);

    // ---- scroll mapping (same section tops the rail + grid use) ----
    let tops: number[] = [];
    let stops: { x: number; y: number }[] = [];
    const measure = () => {
      const main = document.querySelector("main");
      const mainLeft = main ? main.getBoundingClientRect().left : 0;
      const railX = mainLeft + 40; // just left of the circuit trace
      tops = [];
      stops = SECTION_IDS.map((id, idx) => {
        const el = document.getElementById(id);
        tops.push(el ? el.getBoundingClientRect().top + window.scrollY : 0);
        let x = railX;
        if (LANES[idx] === "right") {
          // park beside the section's text block, hugging the screen
          // edge when the text runs nearly full width
          const block = el?.querySelector(":scope > div");
          const right = block
            ? block.getBoundingClientRect().right
            : window.innerWidth * 0.8;
          x = Math.min(right + 95, window.innerWidth - 85);
        }
        return { x, y: STOP_Y[idx] * window.innerHeight };
      });
    };

    const cur: Expr = { ...EXPRESSIONS[0] };
    measure();
    let px = stops[0].x;
    let py = stops[0].y;
    let vx = 0;
    let phase = 0; // 0 solid .. 1 phased out while flying over text
    let blinkAt = performance.now() + 2200;
    let leanCur = 0;
    let turnCur = 0;
    let lastSec = 0;
    let spinT = 10; // seconds since the pirouette began
    const SPIN_SECTIONS = [2, 4]; // projects and contact
    let raf = 0;
    let last = performance.now();

    host.style.transform = `translate3d(${px - W / 2}px, ${py - H / 2}px, 0)`;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = now / 1000;

      // continuous section coordinate u in [0, lastIdx]
      const lastIdx = tops.length - 1;
      let u = 0;
      const s = window.scrollY;
      if (lastIdx > 0 && s > tops[0]) {
        if (s >= tops[lastIdx]) {
          u = lastIdx;
        } else {
          let i = 0;
          while (i < lastIdx - 1 && s >= tops[i + 1]) i++;
          u = i + (s - tops[i]) / (tops[i + 1] - tops[i] || 1);
        }
      }

      // glide between per-section stops. The transit is squeezed into the
      // middle 40% of the scroll between sections so the ghost lingers at
      // each stop and hops across quickly.
      const i = Math.min(Math.floor(u), stops.length - 2);
      const f = Math.min(1, Math.max(0, u - i));
      const fr = Math.min(1, Math.max(0, (f - 0.3) / 0.4));
      const ease = fr * fr * (3 - 2 * fr);
      const tx = stops[i].x + (stops[i + 1].x - stops[i].x) * ease;
      const ty = stops[i].y + (stops[i + 1].y - stops[i].y) * ease;

      const nx = px + (tx - px) * (1 - Math.exp(-4 * dt));
      vx = dt > 0 ? (nx - px) / dt : 0;
      px = nx;
      py += (ty - py) * (1 - Math.exp(-4 * dt));

      // phase out while flying between lanes (or moving fast for any
      // reason) so text underneath stays readable; re-materialize parked
      const between = 4 * ease * (1 - ease); // 1 midway between stops
      const speedF = THREE.MathUtils.clamp(Math.abs(vx) / 1500, 0, 1);
      const phaseTarget = Math.max(between, speedF) * 0.9;
      phase += (phaseTarget - phase) * (1 - Math.exp(-10 * dt));

      host.style.opacity = String(1 - phase);
      host.style.transform = `translate3d(${px - W / 2}px, ${
        py - H / 2 - 38 * phase
      }px, 0) scale(${1 - 0.4 * phase})`;

      // lean into the motion, bob in place
      const lean = THREE.MathUtils.clamp(-vx * 0.0009, -0.35, 0.35);
      leanCur += (lean - leanCur) * (1 - Math.exp(-6 * dt));
      const turn = THREE.MathUtils.clamp(vx * 0.0012, -0.55, 0.55);
      turnCur += (turn - turnCur) * (1 - Math.exp(-5 * dt));

      // idle sway while parked (fades away while phased out / in flight)
      const parked = 1 - phase;
      const sway = Math.sin(t * 0.9) * parked;
      ghost.rotation.z = leanCur + sway * 0.08;
      ghost.position.x = sway * 0.12;
      ghost.position.y =
        Math.sin(t * 1.8) * 0.07 + Math.sin(t * 0.9 + 0.8) * 0.035 * parked;

      // a pirouette when it reaches the projects or contact section
      const sec = Math.round(u);
      if (sec !== lastSec) {
        lastSec = sec;
        if (SPIN_SECTIONS.includes(sec)) spinT = 0;
      }
      spinT += dt;
      const sp = Math.min(1, spinT / 1.15);
      const spinAngle = sp < 1 ? sp * sp * (3 - 2 * sp) * Math.PI * 2 : 0;
      ghost.rotation.y = turnCur + spinAngle;

      // waving hem
      const p = bodyGeo.attributes.position;
      for (let k = 0; k < p.count; k++) {
        const by = basePos[k * 3 + 1];
        if (by < -0.55) {
          const a = Math.atan2(basePos[k * 3 + 2], basePos[k * 3]);
          const amt = (-by - 0.55) / 0.9;
          p.setY(k, by + Math.sin(a * 5 + t * 5) * 0.09 * amt);
        }
      }
      p.needsUpdate = true;

      // expression morphs toward the section being read
      const target =
        EXPRESSIONS[Math.min(EXPRESSIONS.length - 1, Math.round(u))] ??
        EXPRESSIONS[0];
      const k = 1 - Math.exp(-5 * dt);
      for (const key of Object.keys(cur) as (keyof Expr)[]) {
        cur[key] += (target[key] - cur[key]) * k;
      }

      // blink on a random timer
      let blink = 0;
      if (now >= blinkAt) {
        const phase = (now - blinkAt) / 140;
        if (phase < 1) {
          blink = Math.sin(phase * Math.PI);
        } else {
          blinkAt = now + 1800 + Math.random() * 2600;
        }
      }

      // reading saccades + glancing toward its own movement
      const lookX = Math.sin(t * 1.4) * 4 + THREE.MathUtils.clamp(vx * 0.02, -7, 7);
      const lookY = 3 + Math.sin(t * 0.5) * 2;

      drawFace(fctx, { ...cur, blink, lookX, lookY });
      faceTex.needsUpdate = true;

      // wave hello as the contact section arrives
      const waveAmt = THREE.MathUtils.clamp((u - (lastIdx - 0.5)) * 2, 0, 1);
      armR.rotation.z = -0.7 + waveAmt * (1.6 + Math.sin(t * 9) * 0.5);
      armL.rotation.z = 0.7 + Math.sin(t * 1.8 + 1) * 0.08;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };

    measure();
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      renderer.dispose();
      bodyGeo.dispose();
      armGeo.dispose();
      faceGeo.dispose();
      bodyMat.dispose();
      faceMat.dispose();
      faceTex.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      onClick={() => onOpenChat?.()}
      role="button"
      aria-label="Portfolio ghost — click to chat"
      className="fixed left-0 top-0 z-30 hidden cursor-pointer will-change-transform lg:block"
    >
      <div ref={mountRef} aria-hidden />
    </div>
  );
}
