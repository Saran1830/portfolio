"use client";

import { useEffect, useRef, useState } from "react";

const TABS = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
] as const;

export default function Sidebar() {
  const [active, setActive] = useState<string>("about");
  const activeRef = useRef(active);
  // Set while a click-triggered smooth scroll is in flight: the scroll spy
  // ignores the intermediate sections it passes so the grid spins exactly
  // once per click, in sync with the scroll.
  const pendingTarget = useRef<string | null>(null);
  const pendingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Single entry point for section changes (click or scroll). The grid's
  // rotation is scroll-driven, so updating the highlight is all we do here.
  const changeActive = (id: string) => {
    if (activeRef.current === id) return;
    activeRef.current = id;
    setActive(id);
  };

  const clearPending = () => {
    pendingTarget.current = null;
    if (pendingTimeout.current) {
      clearTimeout(pendingTimeout.current);
      pendingTimeout.current = null;
    }
  };

  const handleClick = (id: string) => {
    changeActive(id); // one spin, together with the scroll it triggers
    clearPending();
    pendingTarget.current = id;
    // safety net in case the scroll never reaches the target
    pendingTimeout.current = setTimeout(clearPending, 1800);
  };

  // Scroll spy: whichever section crosses the middle of the viewport
  // becomes the active tab.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (pendingTarget.current) {
            // during a click scroll, only the destination re-arms the spy
            if (entry.target.id === pendingTarget.current) clearPending();
            continue;
          }
          changeActive(entry.target.id);
        }
      },
      // a thin horizontal band at the vertical center of the viewport
      { rootMargin: "-45% 0px -45% 0px" }
    );
    for (const tab of TABS) {
      const el = document.getElementById(tab.id);
      if (el) observer.observe(el);
    }
    // a manual scroll cancels the browser's smooth scroll — re-arm the spy
    window.addEventListener("wheel", clearPending, { passive: true });
    window.addEventListener("touchmove", clearPending, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("wheel", clearPending);
      window.removeEventListener("touchmove", clearPending);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className="relative z-20 m-4 rounded-3xl border border-white/10 bg-[#0b0b0f] text-white shadow-2xl shadow-black/40 sm:m-6 lg:fixed lg:bottom-5 lg:left-5 lg:top-5 lg:m-0 lg:w-80 xl:w-96 2xl:w-[26rem]">
      <div className="no-scrollbar flex flex-col gap-8 rounded-3xl px-6 py-10 sm:px-10 lg:h-full lg:gap-4 lg:overflow-y-auto lg:px-8 lg:py-7 xl:px-9">
        {/* identity */}
        <div>
          <div>
            <p className="font-mono text-xs text-[#f6cdb2]/80">
              {"// hello world, I'm"}
            </p>
            <h1 className="mt-2 font-mono text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-[1.8rem]">
              Lakshmi{" "}
              <span className="bg-gradient-to-r from-[#e9b7c1] via-[#b98fd0] to-[#9a79e8] bg-clip-text text-transparent">
                Saranya
              </span>{" "}
              Nunna
            </h1>
            <p className="mt-3 font-mono text-sm text-white/80 lg:mt-2 lg:text-[13px]">
              I build full-stack apps that{" "}
              <span className="text-[#f6cdb2]">think</span>()
            </p>
          </div>
        </div>

        <p className="max-w-md font-mono text-[13px] leading-relaxed text-white/55 lg:text-xs">
          Three+ years shipping production software with Java, Spring Boot,
          Next.js &amp; TypeScript — now teaching software to read, retrieve,
          and reason: LLM workflows, RAG pipelines, and semantic search.
        </p>

        {/* nav: pills on mobile; on desktop it fills the remaining height,
            items spread evenly so Contact sits at the bottom of the screen */}
        <nav className="flex flex-row flex-wrap gap-2 lg:mt-2 lg:flex-1 lg:flex-col lg:justify-between lg:gap-0">
          {TABS.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              onClick={() => handleClick(tab.id)}
              className={`group relative flex items-center gap-3 overflow-hidden rounded-full border px-4 py-2 text-sm transition-colors duration-300 lg:rounded-lg lg:border-transparent lg:px-4 lg:py-[7px] ${
                active === tab.id
                  ? "border-[#f6cdb2]/40 text-white"
                  : "border-white/10 text-white/50 hover:border-white/25 hover:text-white"
              }`}
            >
              {/* gradient sweep that fills in from the left */}
              <span
                aria-hidden
                className={`absolute inset-0 origin-left bg-gradient-to-r from-[#e9b7c1]/25 via-[#b98fd0]/15 to-transparent transition-transform duration-300 ease-out ${
                  active === tab.id
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-100"
                }`}
              />
              {/* dash that elongates when the section is active */}
              <span
                aria-hidden
                className={`relative hidden h-px transition-all duration-300 ease-out lg:block ${
                  active === tab.id
                    ? "w-10 bg-[#f6cdb2]"
                    : "w-4 bg-white/30 group-hover:w-7 group-hover:bg-white/70"
                }`}
              />
              <span className="relative tracking-wide">{tab.label}</span>
              <span
                className={`relative ml-auto hidden font-mono text-xs text-[#f6cdb2] transition-all duration-300 lg:inline ${
                  active === tab.id
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-70"
                }`}
              >
                →
              </span>
            </a>
          ))}
        </nav>

        {/* footer */}
        <div className="border-t border-white/10 pt-6 lg:pt-3">
          <p className="font-display text-lg italic text-white/70 lg:text-base">
            Let&apos;s build something clever.
          </p>
          <div className="mt-4 flex flex-col gap-2 font-mono text-xs text-white/45 lg:mt-2 lg:gap-1.5 lg:text-[11px]">
            <a
              href="mailto:nsara014@ucr.edu"
              className="w-fit transition-colors hover:text-[#f6cdb2]"
            >
              nsara014@ucr.edu
            </a>
            <p className="text-white/30">
              Bhubaneshwar, India · open to relocate globally 🌍
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
