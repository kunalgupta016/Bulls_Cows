// ─── Glass Panel ───────────────────────────────────────────────
// Reusable glassmorphism container with optional glow.

import { motion } from "framer-motion";

export default function GlassPanel({
  children,
  className = "",
  glow = "",
  animate = true,
  ...props
}) {
  const Component = animate ? motion.div : "div";
  const animProps = animate
    ? {
        initial: { opacity: 0, y: 20, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.97 },
        transition: { duration: 0.4, ease: "easeOut" },
      }
    : {};

  return (
    <Component
      className={`glass-panel p-6 ${glow} ${className}`}
      {...animProps}
      {...props}
    >
      {children}
    </Component>
  );
}
