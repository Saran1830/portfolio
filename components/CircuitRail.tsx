"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A large PCB circuit trace running down the main content column.
 *
 * Unlike a fixed sidebar ornament, this is part of the page: it scrolls
 * with the sections. The trace zig-zags between section headings with
 * 45deg jogs; each section gets a via (plated hole) plus a stub trace and
 * pad that "plug into" the heading beside it.
 *
 * The electron pulse maps scroll position between section tops onto the
 * trace between vias, springing softly — so when a section settles into
 * view, the pulse is holding right at that section's heading. Vias light
 * up once the pulse has passed them. Desktop only.
 */

const SECTION_IDS = ["about", "experience", "projects", "skills", "contact"];
const W = 144; // rail width in px
const X_A = 46; // trace x for even sections
const X_B = 102; // trace x for odd sections
const PAD_X = 124; // connector pads line up here, pointing at the headings

type Node = { x: number; y: number };
type Geom = { h: number; d: string; nodes: Node[]; tops: number[] };

export default function CircuitRail() {
  const pathRef = useRef<SVGPathElement>(null);
  const pulseRef = useRef<SVGGElement>(null);
  const viaRefs = useRef<(SVGCircleElement | null)[]>([]);
  const stubRefs = useRef<(SVGLineElement | null)[]>([]);
  const padRefs = useRef<(SVGRectElement | null)[]>([]);
  const [geom, setGeom] = useState<Geom | null>(null);

  // Build the trace from the actual section positions.
  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;

    const build = () => {
      const h = main.scrollHeight;
      const mainRect = main.getBoundingClientRect();
      const nodes: Node[] = [];
      const tops: number[] = [];
      for (let i = 0; i < SECTION_IDS.length; i++) {
        const el = document.getElementById(SECTION_IDS[i]);
        if (!el) return;
        // anchor the via to the section's heading, not the section center
        const heading = el.querySelector("h2") ?? el;
        const r = heading.getBoundingClientRect();
        nodes.push({
          x: i % 2 === 0 ? X_A : X_B,
          y: r.top - mainRect.top + r.height / 2,
        });
        tops.push(el.offsetTop);
      }

      // entry run above the first via, 45deg jogs between vias, exit run
      // below the last one
      const start = Math.max(0, nodes[0].y - 120);
      const end = Math.min(h, nodes[nodes.length - 1].y + 120);
      let d = `M ${nodes[0].x} ${start} L ${nodes[0].x} ${nodes[0].y}`;
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i];
        const b = nodes[i + 1];
        const half = Math.abs(b.x - a.x) / 2;
        const mid = (a.y + b.y) / 2;
        d +=
          ` L ${a.x} ${mid - half} L ${(a.x + b.x) / 2} ${mid}` +
          ` L ${b.x} ${mid + half} L ${b.x} ${b.y}`;
      }
      d += ` L ${nodes[nodes.length - 1].x} ${end}`;

      setGeom({ h, d, nodes, tops });
    };

    build();
    // re-measure once webfonts land (heading metrics shift) and whenever
    // any section changes size
    document.fonts?.ready.then(build);
    const ro = new ResizeObserver(build);
    ro.observe(main);
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (el) ro.observe(el);
    }
    window.addEventListener("resize", build);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", build);
    };
  }, []);

  // Pulse follows the scroll position along the trace with a spring.
  useEffect(() => {
    const path = pathRef.current;
    const pulse = pulseRef.current;
    const main = document.querySelector("main");
    if (!path || !pulse || !main || !geom) return;

    const total = path.getTotalLength();

    // sampled length->y lookup (the path is monotonic in y)
    const N = 600;
    const sampleLen: number[] = [];
    const sampleY: number[] = [];
    for (let i = 0; i <= N; i++) {
      const l = (total * i) / N;
      sampleLen.push(l);
      sampleY.push(path.getPointAtLength(l).y);
    }
    const lenForY = (y: number) => {
      if (y <= sampleY[0]) return sampleLen[0];
      if (y >= sampleY[N]) return sampleLen[N];
      let lo = 0;
      let hi = N;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (sampleY[mid] < y) lo = mid;
        else hi = mid;
      }
      const f = (y - sampleY[lo]) / (sampleY[hi] - sampleY[lo] || 1);
      return sampleLen[lo] + f * (sampleLen[hi] - sampleLen[lo]);
    };

    const nodeLen = geom.nodes.map((n) => lenForY(n.y));
    const tops = geom.tops;
    const lastIdx = tops.length - 1;

    let pos = 0;
    let vel = 0;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // Map scroll position between section tops onto the trace between
      // vias, so a settled section puts the pulse exactly on its heading.
      const scrolled = -main.getBoundingClientRect().top;
      let target: number;
      if (scrolled <= tops[0]) {
        target = nodeLen[0];
      } else if (scrolled >= tops[lastIdx]) {
        target = nodeLen[lastIdx];
      } else {
        let i = 0;
        while (i < lastIdx - 1 && scrolled >= tops[i + 1]) i++;
        const f = (scrolled - tops[i]) / (tops[i + 1] - tops[i] || 1);
        target = nodeLen[i] + f * (nodeLen[i + 1] - nodeLen[i]);
      }

      // underdamped spring: glides, overshoots a touch, settles
      vel += (target - pos) * 55 * dt;
      vel *= Math.exp(-8 * dt);
      pos += vel * dt;

      const at = Math.max(0, Math.min(total, pos));
      const p = path.getPointAtLength(at);
      pulse.setAttribute("transform", `translate(${p.x} ${p.y})`);

      // vias light up as the pulse reaches them; the nearest one glows
      for (let i = 0; i < nodeLen.length; i++) {
        const passed = at >= nodeLen[i] - 4;
        const near = Math.abs(at - nodeLen[i]) < 36;
        const strong = near
          ? "#c77b4f"
          : passed
            ? "rgba(199,123,79,0.7)"
            : "rgba(249,243,232,0.35)";
        viaRefs.current[i]?.setAttribute("stroke", strong);
        viaRefs.current[i]?.setAttribute("r", near ? "8" : "6.5");
        stubRefs.current[i]?.setAttribute("stroke", strong);
        padRefs.current[i]?.setAttribute(
          "fill",
          near ? "#c77b4f" : passed ? "rgba(199,123,79,0.55)" : "rgba(249,243,232,0.25)"
        );
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [geom]);

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-4 z-0 hidden w-36 lg:block xl:left-8"
    >
      {geom && (
        <svg width={W} height={geom.h} viewBox={`0 0 ${W} ${geom.h}`} fill="none">
          {/* glow underlay */}
          <path
            d={geom.d}
            stroke="rgba(154,121,232,0.2)"
            strokeWidth={9}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* main trace */}
          <path
            ref={pathRef}
            d={geom.d}
            stroke="rgba(154,121,232,0.6)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* vias + stub traces plugging into the headings */}
          {geom.nodes.map((n, i) => (
            <g key={SECTION_IDS[i]}>
              <line
                ref={(el) => {
                  stubRefs.current[i] = el;
                }}
                x1={n.x + 9}
                y1={n.y}
                x2={PAD_X}
                y2={n.y}
                stroke="rgba(249,243,232,0.35)"
                strokeWidth={2.5}
              />
              <rect
                ref={(el) => {
                  padRefs.current[i] = el;
                }}
                x={PAD_X}
                y={n.y - 5}
                width={10}
                height={10}
                rx={2}
                fill="rgba(249,243,232,0.25)"
              />
              <circle
                ref={(el) => {
                  viaRefs.current[i] = el;
                }}
                cx={n.x}
                cy={n.y}
                r={6.5}
                fill="#241f35"
                stroke="rgba(249,243,232,0.35)"
                strokeWidth={3}
              />
              <circle cx={n.x} cy={n.y} r={2} fill="#f9f3e8" />
            </g>
          ))}

          {/* electron pulse (positioned imperatively every frame) */}
          <g ref={pulseRef}>
            <circle r={18} fill="rgba(199,123,79,0.18)" />
            <circle r={9} fill="rgba(199,123,79,0.5)" />
            <circle r={4} fill="#9a79e8" />
          </g>
        </svg>
      )}
    </div>
  );
}
