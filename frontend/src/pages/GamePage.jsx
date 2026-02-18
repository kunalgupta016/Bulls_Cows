// ─── Game Page ─────────────────────────────────────────────────
// Main gameplay: guess input, history, leaderboard, winner overlay.

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LiquidBackground from "../components/LiquidBackground";
import GlassPanel from "../components/GlassPanel";
import RippleButton from "../components/RippleButton";
import Leaderboard from "../components/Leaderboard";
import WinnerCelebration from "../components/WinnerCelebration";
import ChatBox from "../components/ChatBox";
import useSound from "../hooks/useSound";
import socket from "../socket";

export default function GamePage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { playCorrect, playWin, playError, playClick } = useSound();

  const [username] = useState(location.state?.username || "");
  const [digitLength] = useState(location.state?.digitLength || 4);
  const [startTime] = useState(location.state?.startTime || Date.now());

  const [guess, setGuess] = useState("");
  const [guessHistory, setGuessHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const inputRef = useRef(null);

  // Redirect if no state
  useEffect(() => {
    if (!location.state?.username) navigate("/");
  }, [location.state, navigate]);

  // Timer
  useEffect(() => {
    if (winner) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, winner]);

  // Socket listeners
  useEffect(() => {
    const onPlayerGuessed = ({ username: uname, bulls, cows }) => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1500);
    };

    const onLeaderboardUpdate = ({ leaderboard: lb }) => {
      setLeaderboard(lb);
      // Check if we're host
      const me = lb.find((p) => p.id === socket.id);
      if (me?.isHost) setIsHost(true);
    };

    const onGameWon = ({ winner: w, secret }) => {
      setWinner(w);
      if (w.id === socket.id) {
        playWin();
      } else {
        playCorrect();
      }
    };

    const onHostChanged = ({ newHostId }) => {
      setIsHost(newHostId === socket.id);
    };

    const onGameRestarted = ({ room }) => {
      navigate(`/lobby/${roomId}`, {
        state: { username, room },
      });
    };

    socket.on("playerGuessed", onPlayerGuessed);
    socket.on("leaderboardUpdate", onLeaderboardUpdate);
    socket.on("gameWon", onGameWon);
    socket.on("hostChanged", onHostChanged);
    socket.on("gameRestarted", onGameRestarted);

    return () => {
      socket.off("playerGuessed", onPlayerGuessed);
      socket.off("leaderboardUpdate", onLeaderboardUpdate);
      socket.off("gameWon", onGameWon);
      socket.off("hostChanged", onHostChanged);
      socket.off("gameRestarted", onGameRestarted);
    };
  }, [roomId, navigate, username, playWin, playCorrect]);

  const handleGuessChange = (e) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, digitLength);
    setGuess(val);
    setError("");
  };

  const submitGuess = useCallback(() => {
    if (!guess || guess.length !== digitLength || winner) return;
    playClick();

    socket.emit("submitGuess", { roomId, guess }, (res) => {
      if (res.error) {
        setError(res.error);
        setShaking(true);
        playError();
        setTimeout(() => setShaking(false), 400);
        return;
      }

      setGuessHistory((prev) => [res.result, ...prev]);
      setGuess("");
      inputRef.current?.focus();

      if (res.result.bulls > 0) {
        playCorrect();
      }
    });
  }, [guess, digitLength, roomId, winner, playClick, playCorrect, playError]);

  const handleRestart = () => {
    socket.emit("restartGame", { roomId }, (res) => {
      if (res.error) setError(res.error);
    });
  };

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <LiquidBackground pulse={pulse} />

      {/* Winner overlay */}
      <AnimatePresence>
        {winner && (
          <WinnerCelebration
            winner={winner}
            onRestart={handleRestart}
            isHost={isHost}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen p-4 flex flex-col">
        {/* Top bar */}
        <motion.div
          className="flex items-center justify-between mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-panel px-4 py-2 flex items-center gap-3 text-sm">
            <span className="text-text-dim">Room</span>
            <span className="font-mono text-white tracking-widest">
              {roomId}
            </span>
          </div>
          <div className="glass-panel px-4 py-2 flex items-center gap-3 text-sm">
            <span className="text-text-dim">⏱</span>
            <span className="font-mono text-white">{fmtTime(elapsed)}</span>
          </div>
          <div className="glass-panel px-4 py-2 text-sm">
            <span className="text-text-dim">Digits:</span>{" "}
            <span className="text-white font-bold">{digitLength}</span>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 max-w-6xl mx-auto w-full">
          {/* Game column */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Guess input */}
            <GlassPanel
              className={`${shaking ? "shake" : ""}`}
              glow={winner ? "" : "glow-primary"}
            >
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  value={guess}
                  onChange={handleGuessChange}
                  onKeyDown={(e) => e.key === "Enter" && submitGuess()}
                  placeholder={`Enter ${digitLength} unique digits`}
                  disabled={!!winner}
                  maxLength={digitLength}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10
                    text-white placeholder-white/25 text-center text-2xl font-mono
                    tracking-[0.5em] input-glow transition-all disabled:opacity-40"
                  autoFocus
                />
                <RippleButton
                  onClick={submitGuess}
                  disabled={guess.length !== digitLength || !!winner}
                  className="px-6"
                >
                  Guess
                </RippleButton>
              </div>
              {error && (
                <motion.p
                  className="text-error text-sm mt-2 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}
            </GlassPanel>

            {/* Guess history */}
            <GlassPanel className="flex-1 overflow-hidden" animate={false}>
              <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
                Your Guesses ({guessHistory.length})
              </h3>
              <div className="overflow-y-auto max-h-[50vh] space-y-1.5 pr-1">
                <AnimatePresence>
                  {guessHistory.map((entry, idx) => (
                    <motion.div
                      key={guessHistory.length - idx}
                      className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/3
                        border border-white/5"
                      initial={{ opacity: 0, x: -30, scale: 0.95 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-text-dim text-xs font-mono w-6 text-right">
                          #{guessHistory.length - idx}
                        </span>
                        <span className="font-mono text-lg text-white tracking-[0.3em]">
                          {entry.guess}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          className="bull-badge"
                          initial={entry.bulls > 0 ? { scale: 0 } : {}}
                          animate={
                            entry.bulls > 0 ? { scale: [0, 1.3, 1] } : {}
                          }
                          transition={{ duration: 0.3 }}
                        >
                          🎯 {entry.bulls}
                        </motion.span>
                        <motion.span
                          className="cow-badge"
                          initial={entry.cows > 0 ? { y: -10, opacity: 0 } : {}}
                          animate={entry.cows > 0 ? { y: 0, opacity: 1 } : {}}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                        >
                          🐄 {entry.cows}
                        </motion.span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {guessHistory.length === 0 && (
                  <p className="text-text-dim text-sm text-center py-8">
                    Enter your first guess above!
                  </p>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Sidebar: Leaderboard */}
          <div className="lg:w-72 flex-shrink-0">
            <Leaderboard players={leaderboard} currentPlayerId={socket.id} />
          </div>
        </div>
      </div>

      <ChatBox roomId={roomId} username={username} />
    </>
  );
}
