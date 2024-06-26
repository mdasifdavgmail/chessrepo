const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const Game = require('./models/Game');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

mongoose.connect('mongodb://localhost:27017/chess', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('joinGame', async (gameId) => {
        try {
            const game = await Game.findById(gameId);
            if (game) {
                socket.join(gameId);
                socket.emit('gameState', game);
            } else {
                console.log(`Game with ID ${gameId} not found.`);
            }
        } catch (error) {
            console.error('Error joining game:', error);
        }
    });

    socket.on('makeMove', async (data) => {
        const { gameId, from, to } = data;
        try {
            const game = await Game.findById(gameId);
            if (game) {
                const piece = game.board[from[0]][from[1]];
                game.board[to[0]][to[1]] = piece;
                game.board[from[0]][from[1]] = null;
                game.moves.push(`${from}-${to}`);
                await game.save();
                io.in(gameId).emit('gameState', game);
            } else {
                console.log(`Game with ID ${gameId} not found.`);
            }
        } catch (error) {
            console.error('Error making move:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.use(express.json());

app.post('/create', async (req, res) => {
    try {
        const newGame = new Game();
        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        console.error('Error creating game:', error);
        res.status(500).json({ error: 'Failed to create game' });
    }
});

const port = 4002;
server.listen(port, () => console.log(`Listening on port ${port}`));
