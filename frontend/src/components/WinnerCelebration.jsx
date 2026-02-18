// ─── Winner Celebration ────────────────────────────────────────
// Animated explosion celebration overlay.

import { motion } from "framer-motion";
import RippleButton from "./RippleButton";

function Particle({ delay, x, y, color }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: Math.random() * 10 + 4,
        height: Math.random() * 10 + 4,
        background: color,
        left: "50%",
        top: "50%",
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{
        x: x,
        y: y,
        opacity: [1, 1, 0],
        scale: [0, 1.5, 0],
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
}

const particleColors = [
  "#7c3aed",
  "#06b6d4",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#14b8a6",
];

export default function WinnerCelebration({ winner, onRestart, isHost }) {
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 0.5,
    x: (Math.random() - 0.5) * 600,
    y: (Math.random() - 0.5) * 600,
    color: particleColors[i % particleColors.length],
  }));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10, 10, 26, 0.95)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      {/* Expanding burst rings */}
      {[0, 0.2, 0.4].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            borderColor: particleColors[i],
            left: "50%",
            top: "50%",
            marginLeft: -100,
            marginTop: -100,
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: 600,
            height: 600,
            opacity: 0,
            marginLeft: -300,
            marginTop: -300,
          }}
          transition={{ duration: 1.5, delay, ease: "easeOut" }}
        />
      ))}

      {/* Winner card */}
      <motion.div
        className="glass-panel p-8 md:p-12 text-center relative z-10 max-w-md mx-4"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
      >
        <motion.div
          className="text-6xl mb-4"
          animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          🏆
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-bold gradient-text mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {winner?.username} Wins!
        </motion.h2>

        <motion.div
          className="space-y-2 mt-6 text-text-dim"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-lg">
            <span className="text-white font-semibold">{winner?.attempts}</span>{" "}
            {winner?.attempts === 1 ? "attempt" : "attempts"}
          </p>
          <p className="text-lg">
            <span className="text-white font-semibold">{winner?.time}s</span>{" "}
            elapsed
          </p>
        </motion.div>

        {isHost && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <RippleButton onClick={onRestart} variant="success">
              Play Again
            </RippleButton>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
