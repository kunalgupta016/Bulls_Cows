// ─── Socket Handler Module ─────────────────────────────────────
// All Socket.io event handlers for the game.

const { generateSecret, calculateBullsCows, validateGuess } = require('./gameLogic');
const {
  createRoom,
  getRoom,
  getAllPublicRooms,
  joinRoom,
  removePlayer,
  deleteRoom,
  getSerializablePlayers,
  getSerializableRoom,
  findRoomBySocket,
} = require('./roomManager');

const RATE_LIMIT_MS = 1000; // 1 guess per second

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`✦ Player connected: ${socket.id}`);

    // ── Create Room ──────────────────────────
    socket.on('createRoom', ({ username }, callback) => {
      if (!username || username.trim().length === 0) {
        return callback({ error: 'Username is required.' });
      }
      if (username.trim().length > 20) {
        return callback({ error: 'Username must be 20 characters or less.' });
      }

      // Prevent joining multiple rooms
      const existingRoom = findRoomBySocket(socket.id);
      if (existingRoom) {
        return callback({ error: 'You are already in a room. Leave first.' });
      }

      const room = createRoom(socket.id, username.trim());
      socket.join(room.id);
      console.log(`✦ Room ${room.id} created by ${username}`);
      callback({ room: getSerializableRoom(room) });
    });

    // ── Join Room ────────────────────────────
    socket.on('joinRoom', ({ roomId, username }, callback) => {
      if (!username || username.trim().length === 0) {
        return callback({ error: 'Username is required.' });
      }
      if (username.trim().length > 20) {
        return callback({ error: 'Username must be 20 characters or less.' });
      }
      if (!roomId) {
        return callback({ error: 'Room ID is required.' });
      }

      const existingRoom = findRoomBySocket(socket.id);
      if (existingRoom) {
        return callback({ error: 'You are already in a room.' });
      }

      const result = joinRoom(roomId.toUpperCase(), socket.id, username.trim());
      if (result.error) {
        return callback({ error: result.error });
      }

      socket.join(roomId.toUpperCase());
      const room = result.room;

      // Broadcast to others in room
      socket.to(room.id).emit('playerJoined', {
        player: { id: socket.id, username: username.trim(), isHost: false },
        players: getSerializablePlayers(room),
      });

      console.log(`✦ ${username} joined room ${room.id}`);
      callback({ room: getSerializableRoom(room) });
    });

    // ── Get Public Rooms ─────────────────────
    socket.on('getPublicRooms', (callback) => {
      callback({ rooms: getAllPublicRooms() });
    });

    // ── Set Digit Length ─────────────────────
    socket.on('setDigitLength', ({ roomId, digitLength }, callback) => {
      const room = getRoom(roomId);
      if (!room) return callback({ error: 'Room not found.' });
      if (room.hostId !== socket.id) return callback({ error: 'Only the host can change settings.' });
      if (room.status !== 'waiting') return callback({ error: 'Cannot change settings during game.' });
      if (![3, 4, 5, 6].includes(digitLength)) return callback({ error: 'Digit length must be 3, 4, 5, or 6.' });

      room.digitLength = digitLength;
      io.to(roomId).emit('settingsUpdated', { digitLength });
      callback({ success: true });
    });

    // ── Start Game ───────────────────────────
    socket.on('startGame', ({ roomId }, callback) => {
      const room = getRoom(roomId);
      if (!room) return callback({ error: 'Room not found.' });
      if (room.hostId !== socket.id) return callback({ error: 'Only the host can start the game.' });
      if (room.status !== 'waiting') return callback({ error: 'Game already started.' });
      if (room.players.size < 2) return callback({ error: 'Need at least 2 players to start.' });

      // Generate secret number
      room.secret = generateSecret(room.digitLength);
      room.status = 'countdown';
      console.log(`✦ Room ${roomId}: Game starting, secret = ${room.secret}`);

      // Initialize guess tracking for all players
      for (const [playerId] of room.players) {
        room.guesses.set(playerId, []);
        room.guessResults.set(playerId, []);
      }

      // Broadcast countdown
      io.to(roomId).emit('gameCountdown', { digitLength: room.digitLength });

      // After 3 seconds, start the game
      setTimeout(() => {
        room.status = 'playing';
        room.startTime = Date.now();
        io.to(roomId).emit('gameStarted', {
          digitLength: room.digitLength,
          startTime: room.startTime,
        });
      }, 3500);

      callback({ success: true });
    });

    // ── Submit Guess ─────────────────────────
    socket.on('submitGuess', ({ roomId, guess }, callback) => {
      const room = getRoom(roomId);
      if (!room) return callback({ error: 'Room not found.' });
      if (room.status !== 'playing') return callback({ error: 'Game is not active.' });
      if (!room.players.has(socket.id)) return callback({ error: 'You are not in this room.' });

      // Rate limit
      const now = Date.now();
      const lastGuess = room.lastGuessTime.get(socket.id) || 0;
      if (now - lastGuess < RATE_LIMIT_MS) {
        return callback({ error: 'Too fast! Wait a moment between guesses.' });
      }

      // Validate guess
      const playerGuesses = room.guesses.get(socket.id) || [];
      const validation = validateGuess(guess, room.digitLength, playerGuesses);
      if (!validation.valid) {
        return callback({ error: validation.reason });
      }

      // Record guess
      room.lastGuessTime.set(socket.id, now);
      playerGuesses.push(guess);
      room.guesses.set(socket.id, playerGuesses);

      // Calculate result
      const result = calculateBullsCows(room.secret, guess);
      const guessEntry = { guess, bulls: result.bulls, cows: result.cows };

      const playerResults = room.guessResults.get(socket.id) || [];
      playerResults.push(guessEntry);
      room.guessResults.set(socket.id, playerResults);

      const player = room.players.get(socket.id);

      // Send result to the guessing player
      callback({
        result: guessEntry,
        guessNumber: playerResults.length,
      });

      // Broadcast to all players that someone guessed
      io.to(roomId).emit('playerGuessed', {
        playerId: socket.id,
        username: player.username,
        guessCount: playerResults.length,
        bulls: result.bulls,
        cows: result.cows,
      });

      // Build leaderboard
      const leaderboard = getSerializablePlayers(room).sort((a, b) => {
        if (b.bestBulls !== a.bestBulls) return b.bestBulls - a.bestBulls;
        return a.guessCount - b.guessCount;
      });
      io.to(roomId).emit('leaderboardUpdate', { leaderboard });

      // Check for winner
      if (result.bulls === room.digitLength) {
        const timeTaken = Math.round((Date.now() - room.startTime) / 1000);
        room.status = 'finished';
        room.winner = {
          id: socket.id,
          username: player.username,
          attempts: playerResults.length,
          time: timeTaken,
        };

        io.to(roomId).emit('gameWon', {
          winner: room.winner,
          secret: room.secret,
        });

        console.log(`✦ Room ${roomId}: ${player.username} won in ${playerResults.length} attempts!`);

        // Auto-delete room after 60 seconds
        setTimeout(() => {
          deleteRoom(roomId);
          console.log(`✦ Room ${roomId} auto-deleted.`);
        }, 60000);
      }
    });

    // ── Restart Game ─────────────────────────
    socket.on('restartGame', ({ roomId }, callback) => {
      const room = getRoom(roomId);
      if (!room) return callback({ error: 'Room not found.' });
      if (room.hostId !== socket.id) return callback({ error: 'Only the host can restart.' });

      // Reset game state
      room.status = 'waiting';
      room.secret = null;
      room.startTime = null;
      room.winner = null;
      room.guesses = new Map();
      room.guessResults = new Map();
      room.lastGuessTime = new Map();

      io.to(roomId).emit('gameRestarted', { room: getSerializableRoom(room) });
      callback({ success: true });
    });

    // ── Chat Message ─────────────────────────
    socket.on('chatMessage', ({ roomId, text }) => {
      const room = getRoom(roomId);
      if (!room) return;
      if (!room.players.has(socket.id)) return;
      if (!text || text.trim().length === 0 || text.trim().length > 200) return;

      const player = room.players.get(socket.id);
      const message = {
        username: player.username,
        text: text.trim(),
        timestamp: Date.now(),
      };
      room.messages.push(message);

      // Keep only last 100 messages
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      io.to(roomId).emit('chatMessage', message);
    });

    // ── Disconnect ───────────────────────────
    socket.on('disconnect', () => {
      console.log(`✦ Player disconnected: ${socket.id}`);
      const roomId = findRoomBySocket(socket.id);
      if (!roomId) return;

      const room = getRoom(roomId);
      if (!room) return;

      const player = room.players.get(socket.id);
      const username = player?.username || 'Unknown';

      const result = removePlayer(roomId, socket.id);

      if (result?.deleted) {
        console.log(`✦ Room ${roomId} deleted (empty).`);
        return;
      }

      if (result?.newHostId) {
        const newHost = room.players.get(result.newHostId);
        io.to(roomId).emit('hostChanged', {
          newHostId: result.newHostId,
          newHostName: newHost?.username || 'Unknown',
        });
        console.log(`✦ Room ${roomId}: New host is ${newHost?.username}`);
      }

      io.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        username,
        players: getSerializablePlayers(room),
      });
    });
  });
}

module.exports = { setupSocketHandlers };
