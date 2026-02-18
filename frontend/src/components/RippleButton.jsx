// ─── Ripple Button ─────────────────────────────────────────────
// Button with ripple effect on click and press depth animation.

import { motion } from "framer-motion";
import { useCallback, useRef } from "react";

export default function RippleButton({
  children,
  onClick,
  className = "",
  disabled = false,
  variant = "primary",
  ...props
}) {
  const btnRef = useRef(null);

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400",
    danger:
      "bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-500 hover:to-pink-400",
    success:
      "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400",
    ghost: "bg-white/5 hover:bg-white/10 border border-white/10",
  };

  const handleClick = useCallback(
    (e) => {
      if (disabled) return;

      // Create ripple
      const btn = btnRef.current;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      ripple.className = "ripple-effect";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      onClick?.(e);
    },
    [onClick, disabled],
  );

  return (
    <motion.button
      ref={btnRef}
      className={`ripple-container relative px-6 py-3 rounded-xl font-semibold text-white
        transition-all duration-200 cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant] || variants.primary} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
