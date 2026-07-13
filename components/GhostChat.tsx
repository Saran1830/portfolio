"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Chat panel where visitors (recruiters!) talk to Boo, the portfolio
 * ghost. Backed by /api/chat — a RAG endpoint that grounds a Groq LLM
 * in Saranya's profile. Opened by clicking the 3D ghost on desktop;
 * on mobile (where the ghost is hidden) a floating launcher appears.
 */

type Message = { role: "user" | "assistant"; content: string };

const GREETING: Message = {
  role: "assistant",
  content:
    "Boo! 👻 I'm the resident ghost of this portfolio. Ask me anything about Saranya — her experience, projects, skills, or whether she'd be a good fit for your team.",
};

const SUGGESTIONS = [
  "What's her AI experience?",
  "Tell me about her projects",
  "Is she open to relocating?",
];

export default function GhostChat({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || busy) return;
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }),
      });
      if (!res.ok) throw new Error(await res.text());
      if (!res.body) throw new Error("no body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer) throw new Error("empty answer");
    } catch (err) {
      const detail =
        err instanceof Error && err.message.includes("GROQ_API_KEY")
          ? err.message
          : "Eek — my spectral connection glitched. Try again in a moment, or email Saranya at nsara014@ucr.edu.";
      setMessages([...history, { role: "assistant", content: detail }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* mobile launcher — the 3D ghost (desktop entry point) is hidden < lg */}
      {!open && (
        <button
          aria-label="Chat with the portfolio ghost"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-[#0b0b0f] text-2xl shadow-2xl shadow-black/50 transition-transform hover:scale-110 lg:hidden"
        >
          👻
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[30rem] max-h-[calc(100dvh-2.5rem)] w-[23rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-[#0b0b0f] shadow-2xl shadow-black/60">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
            <span className="text-2xl">👻</span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-bold text-[#f9f3e8]">
                Boo · portfolio ghost
              </p>
              <p className="truncate font-mono text-[11px] text-[#f9f3e8]/45">
                RAG-powered · answers questions about Saranya
              </p>
            </div>
            <button
              aria-label="Close chat"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-2 py-1 text-lg text-[#f9f3e8]/50 transition-colors hover:text-[#f9f3e8]"
            >
              ✕
            </button>
          </div>

          {/* messages */}
          <div
            ref={listRef}
            className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto rounded-br-md bg-[#9a79e8]/25 text-[#f9f3e8]"
                    : "mr-auto rounded-bl-md border border-white/10 bg-white/5 text-[#f9f3e8]/90"
                }`}
              >
                {m.content ||
                  (busy && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce [animation-delay:120ms]">
                        ·
                      </span>
                      <span className="animate-bounce [animation-delay:240ms]">
                        ·
                      </span>
                    </span>
                  ) : (
                    ""
                  ))}
              </div>
            ))}

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-[#c77b4f]/40 px-3 py-1.5 font-mono text-xs text-[#c77b4f] transition-colors hover:bg-[#c77b4f]/10"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-white/10 p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Saranya…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-[#f9f3e8] placeholder:text-[#f9f3e8]/30 focus:border-[#9a79e8]/50 focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-full bg-[#f9f3e8] px-4 py-2.5 font-mono text-sm text-[#0b0b0f] transition-colors hover:bg-[#f6cdb2] disabled:opacity-40"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
