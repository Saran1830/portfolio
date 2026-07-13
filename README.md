# 👻 Saranya's Portfolio

A dark, playful, single-page portfolio for **Lakshmi Saranya Nunna** — Java full-stack & AI engineer — with a 3D ghost that reads the page along with you and a RAG-powered chatbot that answers recruiters' questions.

**Live:**

---

## What makes it fun

- **Scroll-driven animated backdrop** — a pink→purple gradient grid (HTML canvas) that rotates 90° per section as you scroll, settling perfectly on section boundaries.
- **Circuit rail** — a PCB-style copper trace (SVG) that zig-zags down the page between section headings. An electron pulse rides the trace with a spring physics model, and vias light up as you pass them.
- **3D ghost companion** — built procedurally with **three.js**: a sheet-ghost with a rippling hem that floats across the page as you scroll, parking beside each section like it's reading with you. Its face is drawn live on a canvas texture, so its **expression morphs per section** — impressed at Experience, delighted at Projects, squinting in concentration at Skills, and winking + waving at Contact. It blinks, its eyes saccade like it's reading, it phases out ghost-style when crossing over text, and it pirouettes when it reaches Projects and Contact.
- **💬 RAG chatbot ("Boo")** — click the ghost and chat with the portfolio. A retrieval-augmented pipeline grounds a Groq-hosted LLM in a structured knowledge base about Saranya, so answers stay factual: experience, projects, skills, education, availability. Off-topic questions are politely declined; unknowns point to email instead of hallucinating. **still working on it**

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Styling | Tailwind CSS |
| 3D / animation | three.js (procedural mesh + canvas-texture face), HTML canvas, SVG |
| AI | Groq API (`llama-3.3-70b-versatile`), custom TF-IDF retrieval over profile chunks |
| Hosting | Vercel (auto-deploys from `main`) |

## How the chatbot works

```
visitor question
      │
      ▼
lib/rag.ts ──── TF-IDF scoring over data/profile.ts (13 fact chunks)
      │              └── top-4 relevant chunks
      ▼
app/api/chat/route.ts ── system prompt = persona + grounding rules + chunks
      │
      ▼
Groq chat completion (streamed SSE → re-emitted as plain text)
      │
      ▼
components/GhostChat.tsx ── streaming chat UI
```

The API key lives server-side only; the client never sees it. Conversation history is capped and message sizes limited server-side.

## Running locally

```bash
npm install
cp .env.local.example .env.local   # or create .env.local
# add your key (free): https://console.groq.com/keys
# GROQ_API_KEY=gsk_...
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without a `GROQ_API_KEY`, everything works except the chat, which explains it isn't configured yet.

## Project structure

```
app/
  layout.tsx          # sidebar, backdrop, ghost companion mount
  page.tsx            # About / Experience / Projects / Skills / Contact
  api/chat/route.ts   # RAG chat endpoint (Groq, streaming)
components/
  Sidebar.tsx         # fixed nav card with scroll-spy
  GridBackground.tsx  # scroll-rotating gradient grid (canvas)
  CircuitRail.tsx     # PCB trace + electron pulse (SVG)
  Ghost3D.tsx         # the three.js ghost + expressions
  GhostChat.tsx       # chat panel UI
  GhostCompanion.tsx  # wires ghost click → chat open
data/profile.ts       # chatbot knowledge base (edit to teach Boo)
lib/rag.ts            # lightweight TF-IDF retrieval
```

## Contact

**Saranya Nunna** · [nsara014@ucr.edu](mailto:nsara014@ucr.edu) 
