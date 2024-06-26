import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Square from './Square';

const socket = io('http://localhost:4002');

const Board = ({ gameId }) => {
    const [board, setBoard] = useState(Array(64).fill(null));

    useEffect(() => {
        socket.emit('joinGame', gameId);

        socket.on('gameState', (game) => {
            const newBoard = game.board.flat(); 
            setBoard(newBoard);
        });

        return () => socket.disconnect();
    }, [gameId]);

    const handleMove = (from, to) => {
        socket.emit('makeMove', { gameId, from, to });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 50px)', gridTemplateRows: 'repeat(8, 50px)' }}>
            {board.map((piece, index) => (
                <Square key={index} piece={piece} index={index} onMove={handleMove} />
            ))}
        </div>
    );
};

export default Board;
