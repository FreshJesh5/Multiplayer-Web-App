const httpServer = require("http").createServer();
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "http://127.0.0.1:8080",
      credentials: true
    }
});
const {initGame, gameLoop, getUpdatedVelocity} = require('./game');
const {FRAME_RATE} = require('./constants');
const {makeid} = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {
    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);

    function handleJoinGame(roomName) {
        console.log('on joinGame');
        const room = io.sockets.adapter.rooms.get(roomName);
        const numClients = room ? room.size : 0;
        
        if (numClients === 0) {
          client.emit('unknownCode');
          return;
        } else if (numClients > 1) {
          client.emit('tooManyPlayers');
          return;
        }
    
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);
        
        startGameInterval(roomName);
    }

    function handleNewGame() {
        console.log('on newGame');
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);

        state[roomName] = initGame();

        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
        console.log(io.sockets.adapter.rooms);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (err){
            console.error(err);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state[roomName].players[client.number-1].vel = vel;
        }
    }
});

function startGameInterval(roomName) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state[roomName]);
        if (!winner) {
            emitGameState(roomName, state[roomName]);
        } else {
            emitGameOver(roomName, winner);
            state[roomName] = null;
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

function emitGameState(room, gameState) {
    // Sending game state to everyone in room
    io.sockets.in(room)
      .emit('gameState', JSON.stringify(gameState));
}
  
function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner }));
}


httpServer.listen(3000);
