// ─── Chat Box ──────────────────────────────────────────────────
// In-room chat panel.

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import socket from "../socket";

export default function ChatBox({ roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages((prev) => [...prev.slice(-99), msg]);
      if (!isOpen) setUnread((u) => u + 1);
    };
    socket.on("chatMessage", handleMessage);
    return () => socket.off("chatMessage", handleMessage);
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.emit("chatMessage", { roomId, text: text.trim() });
    setText("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Toggle button */}
      <motion.button
        className="w-12 h-12 rounded-full bg-purple-600/80 backdrop-blur-md flex items-center justify-center
          text-white cursor-pointer hover:bg-purple-500/80 transition-colors relative"
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnread(0);
        }}
      >
        💬
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-5 h-5
            rounded-full flex items-center justify-center font-bold"
          >
            {unread}
          </span>
        )}
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-14 right-0 w-72 glass-panel p-3 flex flex-col"
            style={{ height: 320 }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">
              Chat
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-2 pr-1">
              {messages.length === 0 && (
                <p className="text-text-dim text-xs text-center mt-8">
                  No messages yet
                </p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className="text-xs">
                  <span
                    className={`font-semibold ${msg.username === username ? "text-purple-400" : "text-cyan-400"}`}
                  >
                    {msg.username}:
                  </span>{" "}
                  <span className="text-text">{msg.text}</span>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} className="flex gap-1.5">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Say something..."
                maxLength={200}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10
                  text-xs text-white placeholder-text-dim input-glow"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-purple-600/60 text-xs text-white
                  hover:bg-purple-500/60 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
