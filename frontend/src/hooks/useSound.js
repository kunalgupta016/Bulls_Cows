// ─── Sound Effects Hook ────────────────────────────────────────
// Uses Web Audio API oscillators — no external audio files needed.

import { useCallback, useRef } from 'react';

const AudioContext = window.AudioContext || window.webkitAudioContext;

export default function useSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((frequency, duration, type = 'sine', volume = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silently fail if audio is blocked
    }
  }, [getCtx]);

  const playJoin = useCallback(() => {
    playTone(880, 0.15, 'sine', 0.1);
    setTimeout(() => playTone(1100, 0.12, 'sine', 0.08), 80);
  }, [playTone]);

  const playCorrect = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.12);
    setTimeout(() => playTone(659, 0.15, 'sine', 0.12), 100);
    setTimeout(() => playTone(784, 0.2, 'sine', 0.12), 200);
  }, [playTone]);

  const playWin = useCallback(() => {
    const notes = [523, 659, 784, 1047, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.25, 'sine', 0.12), i * 120);
    });
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(200, 0.2, 'square', 0.06);
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone(600, 0.06, 'sine', 0.05);
  }, [playTone]);

  return { playJoin, playCorrect, playWin, playError, playClick };
}
