// ─── Server Entry Point ────────────────────────────────────────
// Express + Socket.io server for Code Ripple.

require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { setupSocketHandlers } = require('./socketHandler');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_URLS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((u) => u.trim());

// CORS — allow configured origins + any Vercel preview deploys
const corsOrigin = (origin, callback) => {
  if (!origin) return callback(null, true); // allow non-browser requests
  if (CLIENT_URLS.includes(origin) || origin.endsWith('.vercel.app')) {
    return callback(null, true);
  }
  callback(new Error('Not allowed by CORS'));
};

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'ok', game: 'Code Ripple: Multiplayer Bulls & Cows' });
});

// Attach socket handlers
setupSocketHandlers(io);

// Start server
server.listen(PORT, () => {
  console.log(`\n  ✦ Code Ripple server running on port ${PORT}`);
  console.log(`  ✦ Accepting connections from ${CLIENT_URLS.join(', ')}\n`);
});
