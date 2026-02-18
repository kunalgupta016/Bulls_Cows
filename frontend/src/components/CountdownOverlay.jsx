// ─── Countdown Overlay ─────────────────────────────────────────
// Full-screen 3…2…1 morph countdown before game starts.

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function CountdownOverlay({ onComplete }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete?.();
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10, 10, 26, 0.92)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background pulse rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border border-purple-500/20"
          style={{ width: ring * 200, height: ring * 200 }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: ring * 0.3,
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.div
            key={count}
            className="countdown-digit select-none"
            initial={{ scale: 2, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.3, opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {count}
          </motion.div>
        )}
        {count === 0 && (
          <motion.div
            key="go"
            className="countdown-digit select-none"
            initial={{ scale: 3, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            GO!
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
