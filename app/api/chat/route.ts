import { retrieve } from "@/lib/rag";

// RAG chat endpoint: retrieves the profile chunks most relevant to the
// visitor's question, grounds a Groq LLM in them, and streams the answer
// back as plain text. The API key never leaves the server.

export const dynamic = "force-dynamic";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      "The chat isn't configured yet — add GROQ_API_KEY to .env.local and restart the server.",
      { status: 503 }
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = (body.messages as ChatMessage[])
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  if (!messages || messages.length === 0) {
    return new Response("Bad request", { status: 400 });
  }

  const lastUser =
    [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const context = retrieve(lastUser, 4)
    .map((c) => `## ${c.title}\n${c.text}`)
    .join("\n\n");

  const system = `You are Boo, the friendly resident ghost of Saranya's portfolio website — a cheerful, slightly playful assistant who answers questions about Lakshmi Saranya Nunna for recruiters and visitors.

Ground rules:
- Answer ONLY from the context below. If the answer isn't there, say you don't know and suggest emailing Saranya at nsara014@ucr.edu.
- Keep answers short and conversational (2-5 sentences). Plain text only — no markdown headings or bullet lists unless listing skills.
- Stay on topic: Saranya's experience, projects, skills, education, and availability. Politely decline anything unrelated (general coding help, trivia, etc.).
- Never invent employers, dates, numbers, or skills that aren't in the context.
- A light ghost pun once in a while is welcome; don't overdo it.

Context about Saranya:
${context}`;

  const upstream = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      stream: true,
      temperature: 0.6,
      max_tokens: 400,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("The spirit realm is busy — please try again shortly.", {
      status: 502,
    });
  }

  // Re-emit Groq's SSE stream as a plain text stream of answer deltas.
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const data = line.trim();
        if (!data.startsWith("data:")) continue;
        const payload = data.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {
          // partial JSON line — will complete on the next chunk
        }
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
