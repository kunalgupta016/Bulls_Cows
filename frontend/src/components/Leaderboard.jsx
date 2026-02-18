// ─── Leaderboard ───────────────────────────────────────────────
// Live sorted leaderboard during gameplay.

import { motion, AnimatePresence } from "framer-motion";

export default function Leaderboard({ players = [], currentPlayerId }) {
  return (
    <div className="glass-panel p-4">
      <h3 className="text-sm font-semibold text-text-dim uppercase tracking-wider mb-3">
        🏅 Leaderboard
      </h3>
      <div className="space-y-1.5">
        <AnimatePresence>
          {players.map((player, idx) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm
                ${player.id === currentPlayerId ? "bg-purple-500/15 border border-purple-500/20" : "bg-white/3"}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-text-dim font-mono w-5 text-right">
                  {idx === 0 ? "👑" : `#${idx + 1}`}
                </span>
                <span className="font-medium truncate max-w-[120px]">
                  {player.username}
                  {player.isHost && (
                    <span className="ml-1 text-xs text-purple-400">(Host)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 text-text-dim">
                <span className="bull-badge text-xs">{player.bestBulls}🎯</span>
                <span className="text-xs">{player.guessCount} tries</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
