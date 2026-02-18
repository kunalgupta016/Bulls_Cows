# 🌊 Code Ripple: Multiplayer Bulls & Cows

A real-time multiplayer Bulls & Cows number-guessing game with room-based competition, liquid morphing UI, and glassmorphism design.

## Tech Stack

| Layer    | Technologies                                        |
|----------|-----------------------------------------------------|
| Frontend | React, Tailwind CSS v4, Framer Motion, Socket.io    |
| Backend  | Node.js, Express, Socket.io, In-memory Map storage  |

## Game Rules

- The server generates a secret number with **unique digits**
- **Bulls** = correct digit in correct position 🎯
- **Cows** = correct digit in wrong position 🐄
- First player to guess all bulls wins!

## Setup

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm start        # or: npm run dev (auto-reload)
```

Runs on `http://localhost:4000` by default.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Environment Variables

**backend/.env**
```
PORT=4000
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_SERVER_URL=http://localhost:4000
```

## Folder Structure

```
Bulls_Cows/
├── backend/
│   ├── server.js          # Express + Socket.io entry
│   ├── gameLogic.js       # Secret generation, bulls/cows calc
│   ├── roomManager.js     # In-memory room management
│   ├── socketHandler.js   # All socket event handlers
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Landing, Lobby, Game pages
│   │   ├── hooks/         # useSound hook
│   │   ├── socket.js      # Socket.io client
│   │   ├── App.jsx        # Router + transitions
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Tailwind + custom theme
│   ├── index.html
│   ├── vite.config.js
│   ├── .env
│   └── package.json
└── README.md
```

## Features

- 🎮 Room-based multiplayer (up to 16 players)
- ⚡ Real-time Socket.io communication
- 🏆 Live leaderboard
- 💬 In-room chat
- 🎨 Liquid morphing animated background
- 🔒 Server-side validation & rate limiting
- 👑 Auto host migration on disconnect
- 🔊 Web Audio API sound effects
- 📱 Fully responsive (mobile + desktop)
