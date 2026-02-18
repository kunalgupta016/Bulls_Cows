// ─── Lobby Page ────────────────────────────────────────────────
// Room lobby with player list, host controls, and game start.

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LiquidBackground from "../components/LiquidBackground";
import GlassPanel from "../components/GlassPanel";
import RippleButton from "../components/RippleButton";
import useSound from "../hooks/useSound";
import CountdownOverlay from "../components/CountdownOverlay";
import ChatBox from "../components/ChatBox";
import socket from "../socket";

export default function LobbyPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { playJoin, playClick } = useSound();

  const [room, setRoom] = useState(location.state?.room || null);
  const [players, setPlayers] = useState(location.state?.room?.players || []);
  const [username] = useState(location.state?.username || "");
  const [digitLength, setDigitLength] = useState(
    location.state?.room?.digitLength || 4,
  );
  const [isHost, setIsHost] = useState(room?.hostId === socket.id);
  const [showCountdown, setShowCountdown] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Redirect if no state
  useEffect(() => {
    if (!location.state?.username) {
      navigate("/");
    }
  }, [location.state, navigate]);

  // Socket listeners
  useEffect(() => {
    const onPlayerJoined = ({ players: newPlayers }) => {
      setPlayers(newPlayers);
      playJoin();
    };

    const onPlayerLeft = ({ players: newPlayers }) => {
      setPlayers(newPlayers);
    };

    const onHostChanged = ({ newHostId, newHostName }) => {
      setIsHost(newHostId === socket.id);
      setPlayers((prev) =>
        prev.map((p) => ({ ...p, isHost: p.id === newHostId })),
      );
    };

    const onSettingsUpdated = ({ digitLength: dl }) => {
      setDigitLength(dl);
    };

    const onGameCountdown = () => {
      setShowCountdown(true);
    };

    const onGameStarted = ({ digitLength: dl, startTime }) => {
      navigate(`/game/${roomId}`, {
        state: { username, digitLength: dl, startTime },
      });
    };

    socket.on("playerJoined", onPlayerJoined);
    socket.on("playerLeft", onPlayerLeft);
    socket.on("hostChanged", onHostChanged);
    socket.on("settingsUpdated", onSettingsUpdated);
    socket.on("gameCountdown", onGameCountdown);
    socket.on("gameStarted", onGameStarted);

    return () => {
      socket.off("playerJoined", onPlayerJoined);
      socket.off("playerLeft", onPlayerLeft);
      socket.off("hostChanged", onHostChanged);
      socket.off("settingsUpdated", onSettingsUpdated);
      socket.off("gameCountdown", onGameCountdown);
      socket.off("gameStarted", onGameStarted);
    };
  }, [roomId, navigate, username, playJoin]);

  const handleDigitChange = (dl) => {
    playClick();
    socket.emit("setDigitLength", { roomId, digitLength: dl }, (res) => {
      if (res.error) setError(res.error);
    });
  };

  const handleStart = () => {
    setError("");
    playClick();
    socket.emit("startGame", { roomId }, (res) => {
      if (res.error) setError(res.error);
    });
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <LiquidBackground />

      <AnimatePresence>
        {showCountdown && <CountdownOverlay onComplete={() => {}} />}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <GlassPanel className="max-w-lg w-full" glow="glow-primary">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold gradient-text">Game Lobby</h2>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-text-dim text-sm">Room:</span>
              <button
                onClick={copyRoomId}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10
                  font-mono text-lg tracking-[0.3em] text-white hover:bg-white/10
                  transition-colors cursor-pointer"
              >
                {roomId}
              </button>
              <AnimatePresence>
                {copied && (
                  <motion.span
                    className="text-success text-xs"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    Copied!
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Players */}
          <div className="mb-6">
            <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-3">
              Players ({players.length}/16)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <AnimatePresence>
                {players.map((player, idx) => (
                  <motion.div
                    key={player.id}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm
                      ${player.id === socket.id ? "bg-purple-500/15 border border-purple-500/20" : "bg-white/3 border border-white/5"}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: idx * 0.05 }}
                    layout
                  >
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500
                      flex items-center justify-center text-xs font-bold text-white"
                    >
                      {player.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-white">
                        {player.username}
                      </p>
                      {player.isHost && (
                        <p className="text-xs text-purple-400">Host</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Host controls */}
          {isHost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Digit length selector */}
              <div>
                <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2">
                  Digit Length
                </h3>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((dl) => (
                    <button
                      key={dl}
                      onClick={() => handleDigitChange(dl)}
                      className={`flex-1 py-2 rounded-xl font-bold text-lg transition-all cursor-pointer
                        ${
                          digitLength === dl
                            ? "bg-purple-600/50 border border-purple-400/40 text-white glow-primary"
                            : "bg-white/5 border border-white/10 text-text-dim hover:bg-white/10"
                        }`}
                    >
                      {dl}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-error text-sm text-center">{error}</p>
              )}

              <RippleButton
                onClick={handleStart}
                variant="success"
                className="w-full text-lg py-3.5"
                disabled={players.length < 2}
              >
                🚀 Start Game
              </RippleButton>

              {players.length < 2 && (
                <p className="text-text-dim text-xs text-center">
                  Need at least 2 players to start
                </p>
              )}
            </motion.div>
          )}

          {!isHost && (
            <div className="text-center text-text-dim text-sm py-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Waiting for host to start the game...
              </motion.div>
            </div>
          )}
        </GlassPanel>
      </div>

      <ChatBox roomId={roomId} username={username} />
    </>
  );
}
