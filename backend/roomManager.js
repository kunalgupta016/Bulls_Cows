// ─── Room Manager Module ───────────────────────────────────────
// In-memory room storage and management using a Map.

const { v4: uuidv4 } = require('uuid');

/** @type {Map<string, Room>} */
const rooms = new Map();

/**
 * Room shape:
 * {
 *   id: string,
 *   hostId: string,          // socket.id of the host
 *   players: Map<socketId, { id, username, joinedAt }>,
 *   digitLength: number,     // 3-6
 *   secret: string | null,
 *   status: 'waiting' | 'countdown' | 'playing' | 'finished',
 *   startTime: number | null,
 *   winner: { id, username, attempts, time } | null,
 *   guesses: Map<socketId, string[]>,  // each player's guess history
 *   guessResults: Map<socketId, Array<{ guess, bulls, cows }>>,
 *   lastGuessTime: Map<socketId, number>,  // rate limiting
 *   createdAt: number,
 *   messages: Array<{ username, text, timestamp }>  // chat
 * }
 */

function createRoom(hostSocketId, username) {
  const roomId = uuidv4().slice(0, 6).toUpperCase();
  const room = {
    id: roomId,
    hostId: hostSocketId,
    players: new Map(),
    digitLength: 4,
    secret: null,
    status: 'waiting',
    startTime: null,
    winner: null,
    guesses: new Map(),
    guessResults: new Map(),
    lastGuessTime: new Map(),
    createdAt: Date.now(),
    messages: [],
  };

  room.players.set(hostSocketId, {
    id: hostSocketId,
    username,
    joinedAt: Date.now(),
  });

  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId) || null;
}

function getAllPublicRooms() {
  const list = [];
  for (const [id, room] of rooms) {
    if (room.status === 'waiting') {
      list.push({
        id,
        playerCount: room.players.size,
        maxPlayers: 16,
        digitLength: room.digitLength,
        hostName: room.players.get(room.hostId)?.username || 'Unknown',
      });
    }
  }
  return list;
}

function joinRoom(roomId, socketId, username) {
  const room = rooms.get(roomId);
  if (!room) return { error: 'Room not found.' };
  if (room.status !== 'waiting') return { error: 'Game already in progress.' };
  if (room.players.size >= 16) return { error: 'Room is full (max 16 players).' };

  // Check duplicate username
  for (const [, player] of room.players) {
    if (player.username.toLowerCase() === username.toLowerCase()) {
      return { error: 'Username already taken in this room.' };
    }
  }

  room.players.set(socketId, {
    id: socketId,
    username,
    joinedAt: Date.now(),
  });

  return { room };
}

function removePlayer(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;

  room.players.delete(socketId);
  room.guesses.delete(socketId);
  room.guessResults.delete(socketId);
  room.lastGuessTime.delete(socketId);

  // If room is empty, delete it
  if (room.players.size === 0) {
    rooms.delete(roomId);
    return { deleted: true };
  }

  // If host left, assign new host
  if (socketId === room.hostId) {
    const firstPlayer = room.players.keys().next().value;
    room.hostId = firstPlayer;
    return { newHostId: firstPlayer, room };
  }

  return { room };
}

function deleteRoom(roomId) {
  rooms.delete(roomId);
}

function getSerializablePlayers(room) {
  const players = [];
  for (const [, player] of room.players) {
    players.push({
      id: player.id,
      username: player.username,
      isHost: player.id === room.hostId,
      guessCount: room.guessResults.get(player.id)?.length || 0,
      bestBulls: room.guessResults.get(player.id)?.reduce((max, r) => Math.max(max, r.bulls), 0) || 0,
    });
  }
  return players;
}

function getSerializableRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    players: getSerializablePlayers(room),
    digitLength: room.digitLength,
    status: room.status,
    startTime: room.startTime,
    winner: room.winner,
  };
}

// Find which room a socket belongs to
function findRoomBySocket(socketId) {
  for (const [roomId, room] of rooms) {
    if (room.players.has(socketId)) {
      return roomId;
    }
  }
  return null;
}

module.exports = {
  rooms,
  createRoom,
  getRoom,
  getAllPublicRooms,
  joinRoom,
  removePlayer,
  deleteRoom,
  getSerializablePlayers,
  getSerializableRoom,
  findRoomBySocket,
};
