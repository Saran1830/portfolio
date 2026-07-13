import CircuitRail from "@/components/CircuitRail";

const EXPERIENCE = [
  {
    role: "Next.js Full-Stack Developer",
    company: "ES RealEstate Consortium Corp · via HireByte LLC",
    place: "Arlington, VA · remote",
    period: "current",
    points: [
      "Delivered 4 production Next.js 14 + TypeScript + Tailwind applications across real estate listings, construction, lending, and commerce — improving page load performance ~35% with SSR/ISR, image optimization, and API response handling.",
      "Built 20+ reusable UI and API-integrated components (property cards, search filters, inquiry and lending forms) shared across 4 client platforms.",
      "Raised Lighthouse scores to 90+ on key production pages and cut deployments from ~45 minutes to under 8 with GitHub Actions + Vercel CI/CD.",
    ],
  },
  {
    role: "Software Engineer",
    company: "Inspired Technology",
    place: "Atlanta, GA",
    period: "Jan 2025 — Dec 2025",
    points: [
      "Frontend of a commercial bulk-email SaaS sending personalized, AI-driven campaigns at scale for client businesses.",
      "Built a React + TypeScript campaign dashboard with real-time send progress, audience visualizations, and per-recipient previews — cutting campaign setup from ~45 minutes to under 10.",
      "Developed an audience segmentation and scoring interface with 10+ filter criteria and live segment-size previews before sending.",
    ],
  },
  {
    role: "Software Engineer",
    company: "CodeAce Solutions",
    place: "Newark, NJ",
    period: "Apr 2024 — Dec 2024",
    points: [
      "Full-stack features for a retail equity crowdfunding platform: campaign discovery, onboarding, KYC document flows, and portfolio tracking.",
      "Built 12+ React components from 15+ Figma designs and Spring Boot REST APIs for onboarding, KYC status, and portfolio history.",
      "Shipped a 5+ step onboarding flow with document upload and eligibility checks, reducing signup drop-off ~25%; portfolio dashboard contributed to a reported 3x rise in return visits.",
    ],
  },
  {
    role: "Technology Assistant",
    company: "University of California, Riverside",
    place: "Riverside, CA",
    period: "Sept 2022 — Dec 2023",
    points: [
      "Built and maintained university websites on Drupal with custom content types, Views, and reusable components.",
      "Improved SEO, accessibility, and performance by optimizing templates, metadata, and page structure; supported low-risk production releases.",
    ],
  },
];

const PROJECTS = [
  {
    name: "AI Compliance Document Reviewer",
    status: "MVP shipped",
    tags: ["Next.js", "TypeScript", "LLM APIs", "RAG"],
    desc: "Detects missing clauses, risky language, and compliance gaps across vendor contracts, privacy policies, and audit documents. RAG workflow end to end: chunking, clause classification, semantic retrieval, citation-grounded Q&A, and structured risk scoring with severity labels and source snippets.",
  },
  {
    name: "AI Research Discovery Engine",
    status: "in progress",
    tags: ["Next.js", "TypeScript", "LLM APIs", "RAG"],
    desc: "Search, summarize, and compare technical papers with natural-language queries — paper ingestion, metadata extraction, relevance ranking, and citation-backed summaries covering key contributions, limitations, and related-work comparisons.",
  },
  {
    name: "Secure Chat App",
    status: "in progress",
    tags: ["Spring Boot", "MongoDB", "JWT"],
    desc: "WhatsApp-style secure messaging platform featuring a “Secret Chat inside Normal Chat” mode protected by PIN.",
  },
];

const SKILLS: [string, string[]][] = [
  ["Languages", ["Java", "TypeScript", "JavaScript", "SQL", "Python (basics)", "Rust (basics)"]],
  ["Backend & APIs", ["Java 8/17", "Spring Boot", "Spring MVC", "REST APIs", "Node.js", "Express.js", "GraphQL (basics)"]],
  ["Frontend", ["React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Responsive design", "Accessibility / WCAG"]],
  ["AI / GenAI", ["LLM APIs", "Prompt workflows", "RAG", "Document parsing & chunking", "Semantic search", "Citation-grounded responses", "Structured output"]],
  ["Databases", ["PostgreSQL", "MySQL", "Supabase", "NeonDB", "Firestore", "BigQuery", "MongoDB (basics)"]],
  ["Testing & QA", ["JUnit", "Mockito", "Selenium", "Cypress", "Jest", "PyTest", "TestNG"]],
  ["DevOps & Tools", ["Git", "GitHub Actions", "GitLab", "Jenkins", "CI/CD", "Docker (basics)", "Vercel", "Jira", "Agile/Scrum"]],
];

function Shell({
  n,
  id,
  title,
  children,
}: {
  n: string;
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="flex min-h-screen flex-col px-6 pb-24 pt-24 sm:px-10 lg:pl-52 lg:pr-16"
    >
      <p className="font-mono text-sm text-[#f9f3e8]/50">{n}</p>
      <h2 className="mt-2 font-display text-4xl tracking-tight text-[#f9f3e8] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function Home() {
  return (
    <main className="relative bg-[#0b0b0f] lg:bg-transparent">
      <CircuitRail />

      {/* 01 — about */}
      <Shell n="01" id="about" title="About">
        <div className="mt-10 grid max-w-4xl gap-10 lg:grid-cols-[1fr_15rem]">
          <div className="space-y-5 text-[17px] leading-relaxed text-[#f9f3e8]/75">
            <p>
              I&apos;m a Java full-stack engineer with 3+ years building
              scalable web applications with Java, Spring Boot, React,
              Next.js, TypeScript, and SQL — from backend service design to
              frontend architecture, CI/CD, and production delivery.
            </p>
            <p>
              Lately my work has centered on AI-enabled applications: LLM
              workflows, retrieval-augmented generation, document analysis,
              semantic search, and structured data extraction. I like
              building the whole thing — the retrieval pipeline, the API,
              and the interface that makes it feel effortless.
            </p>
            <p>
              I care about production quality: performance budgets,
              accessibility, testing, and releases that don&apos;t wake
              anyone up at night.
            </p>
            <p>
              Most of all, I love learning new things and I&apos;m always
              up for a challenge. If a project calls for a tool, framework,
              or language I haven&apos;t touched yet, that&apos;s not a
              blocker — it&apos;s the fun part. I&apos;ll happily pick it
              up and be productive fast.
            </p>
          </div>
          <aside className="h-fit rounded-2xl border border-[#f9f3e8]/10 bg-white/5 p-6 shadow-sm">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#c77b4f]">
              Education
            </h3>
            <p className="mt-3 text-sm font-medium text-[#f9f3e8]">
              MS, Computer Science
            </p>
            <p className="text-sm text-[#f9f3e8]/60">
              University of California, Riverside
            </p>
            <p className="mt-4 text-sm font-medium text-[#f9f3e8]">
              B.Tech, Electronics &amp; Communication
            </p>
            <p className="text-sm text-[#f9f3e8]/60">
              IIIT Tiruchirappalli · gold medalist
            </p>
            <h3 className="mt-6 font-mono text-xs uppercase tracking-widest text-[#c77b4f]">
              Base
            </h3>
            <p className="mt-3 text-sm text-[#f9f3e8]/60">
              Bhubaneshwar, India · open to relocating globally
            </p>
          </aside>
        </div>
      </Shell>

      {/* 02 — experience */}
      <Shell n="02" id="experience" title="Experience">
        <div className="mt-12 max-w-4xl space-y-6">
          {EXPERIENCE.map((job) => (
            <article
              key={job.company}
              className="rounded-2xl border border-[#f9f3e8]/10 bg-white/5 p-6 shadow-sm sm:p-8"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="font-display text-xl text-[#f9f3e8] sm:text-2xl">
                  {job.role}
                </h3>
                <p className="font-mono text-xs text-[#c77b4f]">{job.period}</p>
              </div>
              <p className="mt-1 text-sm font-medium text-[#9a79e8]">
                {job.company} · {job.place}
              </p>
              <ul className="mt-4 space-y-2.5 text-[15px] leading-relaxed text-[#f9f3e8]/70">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c77b4f]" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Shell>

      {/* 03 — projects */}
      <Shell n="03" id="projects" title="Projects">
        <div className="mt-12 grid max-w-5xl gap-6 md:grid-cols-2">
          {PROJECTS.map((project) => (
            <article
              key={project.name}
              className="flex flex-col rounded-2xl border border-[#f9f3e8]/10 bg-white/5 p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-display text-xl text-[#f9f3e8] sm:text-2xl">
                  {project.name}
                </h3>
                <span className="whitespace-nowrap rounded-full border border-[#c77b4f]/40 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-[#c77b4f]">
                  {project.status}
                </span>
              </div>
              <p className="mt-4 flex-1 text-[15px] leading-relaxed text-[#f9f3e8]/70">
                {project.desc}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#9a79e8]/10 px-3 py-1 font-mono text-xs text-[#9a79e8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Shell>

      {/* 04 — skills */}
      <Shell n="04" id="skills" title="Skills">
        <div className="mt-12 max-w-4xl space-y-8">
          {SKILLS.map(([group, items]) => (
            <div key={group}>
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#c77b4f]">
                {group}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[#f9f3e8]/15 bg-white/5 px-3.5 py-1.5 font-mono text-xs text-[#f9f3e8]/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Shell>

      {/* 05 — contact */}
      <Shell n="05" id="contact" title="Contact">
        <div className="mt-10 max-w-2xl">
          <p className="font-display text-3xl italic text-[#f9f3e8] sm:text-4xl">
            Let&apos;s build something clever.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-[#f9f3e8]/65">
            If you&apos;re hiring for AI engineer / AI software engineer
            roles — or just want to talk RAG pipelines, LLM workflows, or
            full-stack builds — my inbox is open.
          </p>
          <a
            href="mailto:nsara014@ucr.edu"
            className="mt-9 inline-block rounded-full bg-[#f9f3e8] px-7 py-3.5 font-mono text-sm text-[#0b0b0f] transition-colors hover:bg-[#f6cdb2]"
          >
            nsara014@ucr.edu
          </a>
          <p className="mt-8 font-mono text-xs text-[#f9f3e8]/45">
            Bhubaneshwar, India · open to relocating globally 🌍
          </p>
        </div>
      </Shell>
    </main>
  );
}
