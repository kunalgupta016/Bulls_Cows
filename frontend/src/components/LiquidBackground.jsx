// ─── Liquid Morphing Background ────────────────────────────────
// Animated gradient blobs that float and morph on a dark background.

import { motion } from "framer-motion";

const blobs = [
  {
    color: "rgba(124, 58, 237, 0.35)",
    size: 500,
    x: "10%",
    y: "15%",
    duration: 22,
  },
  {
    color: "rgba(6, 182, 212, 0.30)",
    size: 450,
    x: "70%",
    y: "20%",
    duration: 26,
  },
  {
    color: "rgba(236, 72, 153, 0.25)",
    size: 400,
    x: "40%",
    y: "65%",
    duration: 20,
  },
  {
    color: "rgba(16, 185, 129, 0.20)",
    size: 350,
    x: "80%",
    y: "70%",
    duration: 24,
  },
  {
    color: "rgba(124, 58, 237, 0.20)",
    size: 300,
    x: "20%",
    y: "80%",
    duration: 28,
  },
  {
    color: "rgba(6, 182, 212, 0.15)",
    size: 380,
    x: "55%",
    y: "40%",
    duration: 18,
  },
];

export default function LiquidBackground({ pulse = false }) {
  return (
    <div className="liquid-bg">
      {blobs.map((blob, i) => (
        <motion.div
          key={i}
          className="liquid-blob"
          style={{
            width: blob.size,
            height: blob.size,
            background: `radial-gradient(circle, ${blob.color}, transparent 70%)`,
            left: blob.x,
            top: blob.y,
          }}
          animate={{
            x: [0, 40, -30, 20, 0],
            y: [0, -30, 40, -20, 0],
            scale: pulse ? [1, 1.2, 1] : [1, 1.08, 0.95, 1.05, 1],
          }}
          transition={{
            duration: pulse ? 1.5 : blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
