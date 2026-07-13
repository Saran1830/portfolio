"use client";

import { useState } from "react";
import Ghost3D from "./Ghost3D";
import GhostChat from "./GhostChat";

// Ties the 3D ghost to the chat: clicking the ghost opens the chat
// panel, and a sticky note in the bottom-left corner points visitors
// at the ghost.
export default function GhostCompanion() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <Ghost3D onOpenChat={() => setChatOpen(true)} />
      <GhostChat open={chatOpen} onOpenChange={setChatOpen} />

      {!chatOpen && (
        <div
          aria-hidden
          className="fixed bottom-4 left-4 z-40 hidden -rotate-3 rounded-sm bg-[#f6cdb2] px-4 py-3 font-mono text-xs leading-relaxed text-[#241f35] shadow-lg shadow-black/40 lg:block"
        >
          psst — click the ghost 👻
          <br />
          to ask me anything!
        </div>
      )}
    </>
  );
}
