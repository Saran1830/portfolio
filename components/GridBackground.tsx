"use client";

import { useEffect, useRef } from "react";

/**
 * Animated portfolio background.
 *
 * A pink -> purple gradient plane is tiled into squares outlined by white
 * grid lines, sitting on a peach backdrop. One seamless loop, in three acts:
 *
 *   1. ZOOM   — the intact grid zooms in and back out in place.
 *               No gaps, no peach.
 *   2. TURN   — the intact grid rotates 90deg in place.
 *               Still no gaps, no peach.
 *   3. SPLIT  — the squares pull apart (rippling out from the center)
 *               and reveal the peach backdrop; while held apart the whole
 *               grid rotates a further 90deg; then the squares merge back.
 *
 * The loop is seamless: zoom returns to 1, every gap closes before the
 * cycle ends, and the rotations total exactly 180deg — a multiple of
 * 90deg, which on a uniform square grid is identical to the starting
 * pattern. The gradient stays fixed to the screen while the grid moves.
 *
 * Set ANIMATE to true to run the loop; false renders the static grid.
 *
 * The grid's rotation is driven by scroll: each section scrolled is 90deg
 * of intact rotation (no splitting), so the spin speed matches the scroll
 * speed exactly, and a settled section always lands on a clean multiple
 * of 90deg — identical to the resting pattern.
 */

const ANIMATE = false; // animation paused for now — flip to true to resume

const SECTION_IDS = ["about", "experience", "projects", "skills", "contact"];

const CELL = 92; // base cell size in CSS px
const CYCLE = 14000; // full animation cycle in ms

const PEACH = "#f6cdb2";
const GRADIENT_STOPS: [number, string][] = [
  [0, "#e9b7c1"],
  [0.45, "#b98fd0"],
  [1, "#7457d4"],
];
const LINE_COLOR = "rgba(255, 255, 255, 0.32)";
const LINE_WIDTH = 1.5;

const ZOOM_AMPL = 0.28; // grid zooms from 1.0 up to 1.0 + ZOOM_AMPL
const MAX_GAP = 26; // px each square shrinks by while split
const STAGGER = 0.05; // ripple delay from center to corner (cycle fraction)

// ---- phase timeline (fractions of the cycle) ----
const ZOOM_START = 0.0; // act 1: zoom in and back out, grid intact
const ZOOM_END = 0.26;
const TURN = [0.28, 0.46] as const; // act 2: 90deg spin, grid intact
const SPLIT_OPEN = [0.5, 0.64] as const; // act 3: gaps open, peach revealed
const ROTATE = [0.6, 0.86] as const; // 90deg spin while split
const SPLIT_CLOSE = [0.78, 0.94] as const; // gaps close (+ STAGGER <= 0.99)

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** 0 -> 1 ramp over [start, end], eased, clamped outside. */
function ramp(t: number, start: number, end: number): number {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return easeInOutCubic((t - start) / (end - start));
}

/** 0 -> 1 -> 0 bump over [start, end], eased, clamped outside. */
function bump(t: number, start: number, end: number): number {
  if (t <= start || t >= end) return 0;
  const p = (t - start) / (end - start);
  return p < 0.5 ? easeInOutCubic(p * 2) : easeInOutCubic((1 - p) * 2);
}

function drawTile(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  radius: number
) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function" && radius > 0) {
    ctx.roundRect(x, y, size, size, radius);
  } else {
    ctx.rect(x, y, size, size);
  }
  ctx.fill();
  ctx.stroke();
}

export default function GridBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    const start = performance.now();

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const render = (t: number, extraRotation = 0) => {
      // t: 0..1 through the cycle

      // Act 1: zoom in and back out in place. bump() returns to 0, so the
      // grid is back at scale 1 before the split begins.
      const zoom = 1 + ZOOM_AMPL * bump(t, ZOOM_START, ZOOM_END);

      // Act 2: intact 90deg turn; act 3: 90deg more while split apart.
      // 180deg total — a multiple of 90deg, identical to 0deg on this grid.
      // extraRotation carries the tab-change spins on top.
      const rotation =
        ramp(t, TURN[0], TURN[1]) * (Math.PI / 2) +
        ramp(t, ROTATE[0], ROTATE[1]) * (Math.PI / 2) +
        extraRotation;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Peach backdrop, revealed only while the tiles are pulled apart.
      ctx.fillStyle = PEACH;
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Zoom + rotate the grid geometry around the screen center.
      ctx.translate(cx, cy);
      ctx.scale(zoom, zoom);
      ctx.rotate(rotation);
      ctx.translate(-cx, -cy);

      // Keep the gradient vertical on screen: define it along the
      // inverse-rotated "up" direction, scaled back by the zoom, so the
      // grid transform cancels out.
      const halfDiag = Math.hypot(width, height) / 2;
      const reach = halfDiag / zoom;
      const dirX = Math.sin(-rotation);
      const dirY = Math.cos(-rotation);
      const grad = ctx.createLinearGradient(
        cx - dirX * reach,
        cy - dirY * reach,
        cx + dirX * reach,
        cy + dirY * reach
      );
      for (const [stop, color] of GRADIENT_STOPS) grad.addColorStop(stop, color);
      ctx.fillStyle = grad;
      ctx.strokeStyle = LINE_COLOR;
      ctx.lineWidth = LINE_WIDTH;

      // Tile a square region big enough to cover the screen at any angle.
      const cols = Math.ceil((halfDiag * 2) / CELL) + 2;
      const originX = cx - (cols / 2) * CELL;
      const originY = cy - (cols / 2) * CELL;
      const maxDist = halfDiag + CELL;

      for (let row = 0; row < cols; row++) {
        for (let col = 0; col < cols; col++) {
          const x = originX + col * CELL;
          const y = originY + row * CELL;

          // Ripple delay: cells near the center split first. Every cell's
          // gap is fully closed again before the cycle wraps.
          const dist = Math.hypot(x + CELL / 2 - cx, y + CELL / 2 - cy);
          const td = t - (dist / maxDist) * STAGGER;
          const gapF =
            ramp(td, SPLIT_OPEN[0], SPLIT_OPEN[1]) *
            (1 - ramp(td, SPLIT_CLOSE[0], SPLIT_CLOSE[1]));
          const gap = gapF * MAX_GAP;

          const inset = gap / 2;
          const size = CELL - gap;
          drawTile(ctx, x + inset, y + inset, size, Math.min(8, gap));
        }
      }
    };

    // ---- scroll-driven rotation: one section = 90deg ----
    let tops: number[] = [];
    const measure = () => {
      tops = SECTION_IDS.map((id) => {
        const el = document.getElementById(id);
        return el ? el.getBoundingClientRect().top + window.scrollY : 0;
      });
    };

    const targetAngle = () => {
      const last = tops.length - 1;
      if (last < 1) return 0;
      const s = window.scrollY;
      if (s <= tops[0]) return 0;
      if (s >= tops[last]) return last * (Math.PI / 2);
      let i = 0;
      while (i < last - 1 && s >= tops[i + 1]) i++;
      const f = (s - tops[i]) / (tops[i + 1] - tops[i] || 1);
      return (i + f) * (Math.PI / 2);
    };

    let angle = targetAngle();
    let lastDrawn = NaN;
    let lastNow = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;

      // light smoothing so the spin tracks scroll speed without jitter
      angle += (targetAngle() - angle) * (1 - Math.exp(-10 * dt));

      if (ANIMATE) {
        render(((now - start) % CYCLE) / CYCLE, angle);
      } else if (Math.abs(angle - lastDrawn) > 0.0002 || Number.isNaN(lastDrawn)) {
        render(0, angle); // static grid, redrawn only while rotating
        lastDrawn = angle;
      }
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      resize();
      measure();
      lastDrawn = NaN; // force a redraw at the new size
    };

    resize();
    measure();
    // section positions shift when webfonts land or content resizes
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    window.addEventListener("resize", onResize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 z-0 h-full w-full"
    />
  );
}
