// Knowledge base for the portfolio chatbot. Each chunk is a small,
// self-contained fact sheet; the RAG layer retrieves the most relevant
// chunks for a visitor's question and grounds the LLM's answer in them.

export type ProfileChunk = {
  id: string;
  title: string;
  text: string;
};

export const PROFILE_CHUNKS: ProfileChunk[] = [
  {
    id: "identity",
    title: "Who Saranya is",
    text: "Lakshmi Saranya Nunna (goes by Saranya) is a Java full-stack and AI engineer with 3+ years of experience building scalable web applications with Java, Spring Boot, React, Next.js, TypeScript, and SQL. She works across the whole stack: backend service design, frontend architecture, CI/CD, and production delivery. Her tagline: 'I build full-stack apps that think()'. She is based in Bhubaneshwar, India and is open to relocating globally. She is currently looking for AI engineer / AI software engineer roles.",
  },
  {
    id: "mindset",
    title: "Learning mindset and adaptability",
    text: "Saranya loves learning new things and is always up for a challenge. If a role or project involves a tool, framework, or language she hasn't used yet, she is more than willing to learn it — she picks up new technologies quickly and treats unfamiliar stacks as the fun part rather than a blocker. She has repeatedly taught herself new areas on her own initiative, most recently LLM/RAG engineering and 3D graphics with three.js (which powers the ghost on this very site).",
  },
  {
    id: "ai-focus",
    title: "AI and GenAI focus",
    text: "Saranya's recent work centers on AI-enabled applications: LLM workflows, retrieval-augmented generation (RAG), document analysis, semantic search, and structured data extraction. She likes building the whole thing — the retrieval pipeline, the API, and the interface. Her AI/GenAI skills include LLM APIs, prompt workflows, RAG, document parsing and chunking, semantic search, citation-grounded responses, and structured output.",
  },
  {
    id: "exp-esrealestate",
    title: "Current role — Next.js Full-Stack Developer at ES RealEstate Consortium",
    text: "Saranya currently works as a Next.js Full-Stack Developer for ES RealEstate Consortium Corp (via HireByte LLC), remote from Arlington, VA. She delivered 4 production Next.js 14 + TypeScript + Tailwind applications across real estate listings, construction, lending, and commerce, improving page load performance about 35% with SSR/ISR, image optimization, and API response handling. She built 20+ reusable UI and API-integrated components (property cards, search filters, inquiry and lending forms) shared across 4 client platforms, raised Lighthouse scores to 90+ on key production pages, and cut deployments from about 45 minutes to under 8 with GitHub Actions and Vercel CI/CD.",
  },
  {
    id: "exp-inspired",
    title: "Software Engineer at Inspired Technology (Jan 2025 - Dec 2025)",
    text: "At Inspired Technology in Atlanta, GA (January 2025 to December 2025), Saranya worked on the frontend of a commercial bulk-email SaaS that sends personalized, AI-driven campaigns at scale for client businesses. She built a React + TypeScript campaign dashboard with real-time send progress, audience visualizations, and per-recipient previews — cutting campaign setup from about 45 minutes to under 10 — and developed an audience segmentation and scoring interface with 10+ filter criteria and live segment-size previews.",
  },
  {
    id: "exp-codeace",
    title: "Software Engineer at CodeAce Solutions (Apr 2024 - Dec 2024)",
    text: "At CodeAce Solutions in Newark, NJ (April 2024 to December 2024), Saranya built full-stack features for a retail equity crowdfunding platform: campaign discovery, onboarding, KYC document flows, and portfolio tracking. She built 12+ React components from 15+ Figma designs and Spring Boot REST APIs for onboarding, KYC status, and portfolio history. She shipped a 5+ step onboarding flow with document upload and eligibility checks that reduced signup drop-off about 25%; her portfolio dashboard contributed to a reported 3x rise in return visits.",
  },
  {
    id: "exp-ucr",
    title: "Technology Assistant at UC Riverside (Sept 2022 - Dec 2023)",
    text: "At the University of California, Riverside (September 2022 to December 2023), Saranya built and maintained university websites on Drupal with custom content types, Views, and reusable components. She improved SEO, accessibility, and performance by optimizing templates, metadata, and page structure, and supported low-risk production releases.",
  },
  {
    id: "proj-compliance",
    title: "Project — AI Compliance Document Reviewer",
    text: "AI Compliance Document Reviewer (MVP shipped; Next.js, TypeScript, LLM APIs, RAG): detects missing clauses, risky language, and compliance gaps across vendor contracts, privacy policies, and audit documents. Saranya built the RAG workflow end to end: chunking, clause classification, semantic retrieval, citation-grounded Q&A, and structured risk scoring with severity labels and source snippets.",
  },
  {
    id: "proj-research",
    title: "Project — AI Research Discovery Engine",
    text: "AI Research Discovery Engine (in progress; Next.js, TypeScript, LLM APIs, RAG): lets users search, summarize, and compare technical papers with natural-language queries. It covers paper ingestion, metadata extraction, relevance ranking, and citation-backed summaries of key contributions, limitations, and related-work comparisons.",
  },
  {
    id: "proj-chat",
    title: "Project — Secure Chat App",
    text: "Secure Chat App (in progress; Spring Boot, MongoDB, JWT): a WhatsApp-style secure messaging platform featuring a 'Secret Chat inside Normal Chat' mode protected by PIN.",
  },
  {
    id: "skills",
    title: "Technical skills",
    text: "Languages: Java, TypeScript, JavaScript, SQL, Python (basics), Rust (basics). Backend & APIs: Java 8/17, Spring Boot, Spring MVC, REST APIs, Node.js, Express.js, GraphQL (basics). Frontend: React, Next.js, HTML5, CSS3, Tailwind CSS, responsive design, accessibility/WCAG. Databases: PostgreSQL, MySQL, Supabase, NeonDB, Firestore, BigQuery, MongoDB (basics). Testing & QA: JUnit, Mockito, Selenium, Cypress, Jest, PyTest, TestNG. DevOps & tools: Git, GitHub Actions, GitLab, Jenkins, CI/CD, Docker (basics), Vercel, Jira, Agile/Scrum.",
  },
  {
    id: "education",
    title: "Education",
    text: "Saranya holds an MS in Computer Science from the University of California, Riverside, and a B.Tech in Electronics & Communication from IIIT Tiruchirappalli, where she was a gold medalist.",
  },
  {
    id: "contact",
    title: "Contact and availability",
    text: "You can reach Saranya at nsara014@ucr.edu. She is based in Bhubaneshwar, India, open to relocating globally, and interested in AI engineer / AI software engineer roles — or conversations about RAG pipelines, LLM workflows, and full-stack builds.",
  },
  {
    id: "site",
    title: "About this portfolio site",
    text: "This portfolio is built with Next.js 14, TypeScript, and Tailwind CSS. It features a scroll-driven animated grid background, a PCB circuit-trace decoration that follows the sections, a 3D ghost companion built with three.js that reads along with the visitor and changes expressions per section, and this very chatbot — a RAG-powered assistant that answers questions about Saranya.",
  },
];
