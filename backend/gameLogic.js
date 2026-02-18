// ─── Game Logic Module ─────────────────────────────────────────
// Handles secret number generation, guess validation, and bulls/cows calculation.

/**
 * Generate a secret number string with unique digits of the given length.
 * The first digit is never 0.
 */
function generateSecret(digitLength) {
  const digits = [];
  const available = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  // First digit: 1-9 (no leading zero)
  const firstIdx = Math.floor(Math.random() * available.length);
  digits.push(available.splice(firstIdx, 1)[0]);

  // Remaining digits: 0-9 excluding already chosen
  const remaining = [0, ...available];
  for (let i = 1; i < digitLength; i++) {
    const idx = Math.floor(Math.random() * remaining.length);
    digits.push(remaining.splice(idx, 1)[0]);
  }

  return digits.join('');
}

/**
 * Calculate bulls (correct digit + position) and cows (correct digit, wrong position).
 */
function calculateBullsCows(secret, guess) {
  let bulls = 0;
  let cows = 0;

  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) {
      bulls++;
    } else if (secret.includes(guess[i])) {
      cows++;
    }
  }

  return { bulls, cows };
}

/**
 * Validate a guess string:
 * - Correct length
 * - All digits
 * - All unique digits
 * - Not a duplicate of a previous guess
 * Returns { valid: true } or { valid: false, reason: string }
 */
function validateGuess(guess, digitLength, previousGuesses = []) {
  if (!guess || typeof guess !== 'string') {
    return { valid: false, reason: 'Guess is required.' };
  }

  if (guess.length !== digitLength) {
    return { valid: false, reason: `Guess must be exactly ${digitLength} digits.` };
  }

  if (!/^\d+$/.test(guess)) {
    return { valid: false, reason: 'Guess must contain only digits.' };
  }

  const uniqueDigits = new Set(guess.split(''));
  if (uniqueDigits.size !== digitLength) {
    return { valid: false, reason: 'All digits must be unique.' };
  }

  if (previousGuesses.includes(guess)) {
    return { valid: false, reason: 'You already guessed this number.' };
  }

  return { valid: true };
}

module.exports = { generateSecret, calculateBullsCows, validateGuess };
