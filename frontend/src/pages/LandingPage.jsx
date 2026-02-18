// ─── Landing Page ──────────────────────────────────────────────
// Beautiful hero + visual How-to-Play guide + Create/Join Room.

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import LiquidBackground from "../components/LiquidBackground";
import GlassPanel from "../components/GlassPanel";
import RippleButton from "../components/RippleButton";
import useSound from "../hooks/useSound";
import socket from "../socket";

/* ── Animated step card for How to Play ── */
function StepCard({ step, index, icon, title, description, visual }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      className="glass-panel p-5 md:p-6 relative overflow-hidden group"
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      {/* Step number badge */}
      <div
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-cyan-500/30
        border border-white/10 flex items-center justify-center text-xs font-bold text-white/60"
      >
        {step}
      </div>

      {/* Icon */}
      <div className="text-4xl mb-3">{icon}</div>

      {/* Visual example */}
      {visual && (
        <div className="mb-4 rounded-xl bg-white/3 border border-white/5 p-3 font-mono text-sm">
          {visual}
        </div>
      )}

      <h3 className="text-lg font-bold text-white mb-1.5">{title}</h3>
      <p className="text-text-dim text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ── Feature pill ── */
function FeaturePill({ icon, text, delay }) {
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/8
        text-sm text-text-dim"
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.3 }}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </motion.div>
  );
}

/* ── Bull/Cow visual demo row ── */
function DemoRow({ guess, secret, bulls, cows }) {
  return (
    <div className="flex items-center justify-between text-sm py-1.5">
      <div className="flex items-center gap-2">
        <span className="text-text-dim text-xs">Guess:</span>
        <div className="flex gap-1">
          {guess.split("").map((d, i) => {
            const isExact = d === secret[i];
            const isPresent = !isExact && secret.includes(d);
            return (
              <span
                key={i}
                className={`w-7 h-8 rounded-md flex items-center justify-center font-mono font-bold text-sm
                  ${
                    isExact
                      ? "bg-emerald-500/30 border border-emerald-400/40 text-emerald-300"
                      : isPresent
                        ? "bg-amber-500/25 border border-amber-400/30 text-amber-300"
                        : "bg-white/5 border border-white/10 text-white/40"
                  }`}
              >
                {d}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex gap-2">
        <span className="bull-badge">{bulls}🎯</span>
        <span className="cow-badge">{cows}🐄</span>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { playClick, playJoin } = useSound();
  const playRef = useRef(null);

  const [username, setUsername] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!username.trim()) return setError("Enter your name first!");
    setError("");
    setLoading(true);
    playClick();

    socket.emit("createRoom", { username: username.trim() }, (res) => {
      setLoading(false);
      if (res.error) return setError(res.error);
      playJoin();
      navigate(`/lobby/${res.room.id}`, {
        state: { username: username.trim(), room: res.room },
      });
    });
  };

  const handleJoin = () => {
    if (!username.trim()) return setError("Enter your name first!");
    if (!joinRoomId.trim()) return setError("Enter a Room ID!");
    setError("");
    setLoading(true);
    playClick();

    socket.emit(
      "joinRoom",
      { roomId: joinRoomId.trim().toUpperCase(), username: username.trim() },
      (res) => {
        setLoading(false);
        if (res.error) return setError(res.error);
        playJoin();
        navigate(`/lobby/${res.room.id}`, {
          state: { username: username.trim(), room: res.room },
        });
      },
    );
  };

  const scrollToPlay = () => {
    playRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <LiquidBackground />

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════
            SECTION 1 — HERO
        ═══════════════════════════════════════════ */}
        <section className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div
              className="text-7xl md:text-8xl mb-4"
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              🌊
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold gradient-text mb-3 leading-tight">
              Code Ripple
            </h1>

            <motion.p
              className="text-xl md:text-2xl text-text-dim font-light tracking-wide mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Multiplayer Bulls & Cows
            </motion.p>

            <motion.p
              className="text-text-dim/60 text-sm md:text-base max-w-md mx-auto mt-2 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Crack the secret code before your friends do. Real-time,
              competitive, and addictive.
            </motion.p>
          </motion.div>

          {/* Feature pills */}
          <motion.div
            className="flex flex-wrap justify-center gap-2 mt-8 max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <FeaturePill icon="⚡" text="Real-time" delay={0.8} />
            <FeaturePill icon="👥" text="Up to 16 players" delay={0.9} />
            <FeaturePill icon="🏆" text="Live leaderboard" delay={1.0} />
            <FeaturePill icon="💬" text="In-game chat" delay={1.1} />
            <FeaturePill icon="📱" text="Mobile friendly" delay={1.2} />
          </motion.div>

          {/* Scroll CTA */}
          <motion.button
            className="mt-12 flex flex-col items-center gap-2 text-text-dim/50 hover:text-text-dim
              transition-colors cursor-pointer group"
            onClick={scrollToPlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
          >
            <span className="text-sm tracking-wide">Learn how to play</span>
            <motion.span
              className="text-2xl"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              ↓
            </motion.span>
          </motion.button>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 2 — HOW TO PLAY
        ═══════════════════════════════════════════ */}
        <section className="py-16 md:py-24 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
                How to Play
              </h2>
              <p className="text-text-dim text-base max-w-lg mx-auto">
                It's simple — guess the secret number. Here's how it works:
              </p>
            </motion.div>

            {/* Step cards grid */}
            <div className="grid md:grid-cols-2 gap-4 md:gap-5">
              <StepCard
                step={1}
                index={0}
                icon="🚪"
                title="Create or Join a Room"
                description="One player creates a room and shares the 6-character code. Friends join using that code. Up to 16 players can compete!"
                visual={
                  <div className="flex items-center gap-2 text-text-dim">
                    <span className="text-xs">Room:</span>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 tracking-[0.3em] text-sm">
                      A3F9K2
                    </span>
                    <span className="text-xs ml-auto text-emerald-400">
                      ✓ 4 joined
                    </span>
                  </div>
                }
              />

              <StepCard
                step={2}
                index={1}
                icon="🎲"
                title="Server Picks a Secret Number"
                description="The host picks the digit length (3–6). The server generates a number with all unique digits. Nobody knows the secret!"
                visual={
                  <div className="text-center">
                    <span className="text-xs text-text-dim">
                      Secret (hidden):{" "}
                    </span>
                    <span className="inline-flex gap-1 ml-1">
                      {["?", "?", "?", "?"].map((d, i) => (
                        <span
                          key={i}
                          className="w-7 h-8 rounded-md bg-purple-500/15 border border-purple-400/20
                          flex items-center justify-center text-purple-300 font-bold text-sm"
                        >
                          {d}
                        </span>
                      ))}
                    </span>
                  </div>
                }
              />

              <StepCard
                step={3}
                index={2}
                icon="🎯"
                title="Guess & Get Feedback"
                description="Enter your guess. For each digit, you'll learn if it's a Bull (right digit, right position) or a Cow (right digit, wrong position)."
                visual={
                  <div className="space-y-0.5">
                    <div className="text-xs text-text-dim mb-1.5 flex justify-between">
                      <span>
                        Secret: <span className="text-purple-300">5 2 7 1</span>
                      </span>
                      <span>Your guesses ↓</span>
                    </div>
                    <DemoRow guess="1234" secret="5271" bulls={1} cows={1} />
                    <DemoRow guess="5678" secret="5271" bulls={1} cows={1} />
                    <DemoRow guess="5271" secret="5271" bulls={4} cows={0} />
                  </div>
                }
              />

              <StepCard
                step={4}
                index={3}
                icon="🏆"
                title="First to Crack It Wins!"
                description="All players race to guess the same number. The first with all Bulls wins instantly! Speed and logic are your weapons."
                visual={
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl">👑</span>
                      <span className="text-xs text-emerald-400 font-semibold mt-1">
                        Winner!
                      </span>
                      <span className="text-xs text-text-dim">7 guesses</span>
                    </div>
                    <div className="w-px h-10 bg-white/10" />
                    <div className="flex flex-col items-center">
                      <span className="text-2xl opacity-50">🥈</span>
                      <span className="text-xs text-text-dim mt-1">
                        Player 2
                      </span>
                      <span className="text-xs text-text-dim">
                        still guessing...
                      </span>
                    </div>
                  </div>
                }
              />
            </div>

            {/* Bulls vs Cows explainer */}
            <motion.div
              className="glass-panel p-5 md:p-8 mt-6 glow-accent"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-bold text-white mb-4 text-center">
                🎯 Bulls vs 🐄 Cows — Quick Reference
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-emerald-500/8 border border-emerald-500/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bull-badge text-sm">🎯 Bull</span>
                    <span className="text-emerald-400 font-semibold text-sm">
                      = Perfect match
                    </span>
                  </div>
                  <p className="text-text-dim text-sm">
                    Right digit in the{" "}
                    <strong className="text-emerald-300">right position</strong>
                    .
                  </p>
                  <div className="mt-3 font-mono text-sm flex items-center gap-2">
                    <span className="text-text-dim text-xs">Secret:</span>
                    <div className="flex gap-1">
                      {["5", "2", "7", "1"].map((d, i) => (
                        <span
                          key={i}
                          className={`w-6 h-7 rounded flex items-center justify-center text-xs
                          ${
                            i === 0
                              ? "bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold"
                              : "bg-white/5 border border-white/8 text-white/30"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="font-mono text-sm flex items-center gap-2 mt-1">
                    <span className="text-text-dim text-xs">Guess: </span>
                    <div className="flex gap-1">
                      {["5", "9", "3", "8"].map((d, i) => (
                        <span
                          key={i}
                          className={`w-6 h-7 rounded flex items-center justify-center text-xs
                          ${
                            i === 0
                              ? "bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 font-bold"
                              : "bg-white/5 border border-white/8 text-white/30"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-text-dim ml-1">→</span>
                    <span className="bull-badge text-xs">1🎯</span>
                  </div>
                </div>

                <div className="rounded-xl bg-amber-500/8 border border-amber-500/15 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="cow-badge text-sm">🐄 Cow</span>
                    <span className="text-amber-400 font-semibold text-sm">
                      = Wrong spot
                    </span>
                  </div>
                  <p className="text-text-dim text-sm">
                    Right digit but in the{" "}
                    <strong className="text-amber-300">wrong position</strong>.
                  </p>
                  <div className="mt-3 font-mono text-sm flex items-center gap-2">
                    <span className="text-text-dim text-xs">Secret:</span>
                    <div className="flex gap-1">
                      {["5", "2", "7", "1"].map((d, i) => (
                        <span
                          key={i}
                          className={`w-6 h-7 rounded flex items-center justify-center text-xs
                          ${
                            i === 3
                              ? "bg-amber-500/25 border border-amber-400/30 text-amber-200 font-bold"
                              : "bg-white/5 border border-white/8 text-white/30"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="font-mono text-sm flex items-center gap-2 mt-1">
                    <span className="text-text-dim text-xs">Guess: </span>
                    <div className="flex gap-1">
                      {["1", "9", "3", "8"].map((d, i) => (
                        <span
                          key={i}
                          className={`w-6 h-7 rounded flex items-center justify-center text-xs
                          ${
                            i === 0
                              ? "bg-amber-500/25 border border-amber-400/30 text-amber-200 font-bold"
                              : "bg-white/5 border border-white/8 text-white/30"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-text-dim ml-1">→</span>
                    <span className="cow-badge text-xs">1🐄</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            SECTION 3 — PLAY NOW
        ═══════════════════════════════════════════ */}
        <section ref={playRef} className="py-16 md:py-24 px-4">
          <div className="max-w-md mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
                Ready to Play?
              </h2>
              <p className="text-text-dim text-sm">
                Enter your name and create a room or join one!
              </p>
            </motion.div>

            <GlassPanel className="text-center" glow="glow-primary">
              {/* Username Input */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <label className="text-xs text-text-dim uppercase tracking-wider font-semibold block mb-2 text-left">
                  Your Name
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your player name"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10
                    text-white placeholder-white/25 text-center text-lg input-glow transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </motion.div>

              {/* Error */}
              {error && (
                <motion.p
                  className="text-error text-sm mt-3"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.p>
              )}

              {/* Create Room */}
              <div className="mt-5">
                <RippleButton
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full text-lg py-3.5"
                >
                  {loading ? "Creating..." : "✨ Create Room"}
                </RippleButton>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-text-dim text-xs uppercase tracking-widest">
                  or join
                </span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Join Room */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="Room ID"
                  maxLength={6}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10
                    text-white placeholder-white/25 text-center uppercase tracking-widest
                    font-mono text-lg input-glow transition-all"
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                />
                <RippleButton
                  onClick={handleJoin}
                  disabled={loading}
                  variant="ghost"
                  className="px-5"
                >
                  Join
                </RippleButton>
              </div>

              {/* Footer */}
              <p className="text-text-dim/40 text-xs mt-6">
                Up to 16 players • Real-time competition • No sign-up needed
              </p>
            </GlassPanel>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer className="py-8 text-center text-text-dim/30 text-xs border-t border-white/5">
          <p>
            Code Ripple — Built with ♥ using React, Socket.io & Framer Motion
          </p>
        </footer>
      </div>
    </>
  );
}
