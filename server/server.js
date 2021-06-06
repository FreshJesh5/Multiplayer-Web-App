const PORT = process.env.PORT || 3000;
const httpServer = require("http").createServer();
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "*",
      credentials: true
    }
});
const { initGame, gameLoop, getUpdatedVelocity, createGameState } = require('./game');
const { FRAME_RATE, MAX_PLAYERS } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {
    client.on('keydown', handleKeydown);
    client.on('newGame', handleNewGame);
    client.on('joinGame', handleJoinGame);
    client.on('startGame', handleStartGame);

    function handleJoinGame(roomName) {
        console.log('joined game');
        const room = io.sockets.adapter.rooms.get(roomName);
        const numClients = room ? room.size : 0;

        if (numClients === 0) {
            client.emit('unknownCode');
            return;
        } else if (numClients > MAX_PLAYERS-1) {
            client.emit('tooManyPlayers');
            return;
        } else if (state[roomName] && state[roomName].active) {
            client.emit('gameInSession');
            return;
        }
    
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        client.join(roomName);
        client.number = numClients+1;
        //show blank game screen
        client.emit('init', numClients+1);
        //allow client to draw starting position
        io.sockets.in(roomName).emit('gameActive', numClients+1);
        //send starting position
        io.sockets.in(roomName).emit('gameState', JSON.stringify(createGameState(numClients+1)));
    }

    function handleNewGame() {
        console.log('new game created');
        let roomName = makeid(5);
        clientRooms[client.id] = roomName;
        client.emit('gameCode', roomName);
        client.join(roomName);
        client.number = 1;
        //show blank game screen
        client.emit('init', 1);
        client.emit('gameActive', 1);
        client.emit('gameState', JSON.stringify(createGameState(1)));
    }

    function handleStartGame(roomName) {

        //console.log(io.sockets.adapter.rooms);
        const room = io.sockets.adapter.rooms.get(roomName);
        const numClients = room ? room.size : 0;
        io.sockets.in(roomName).emit('gameActive', numClients);
        if (state[roomName] && state[roomName] != null) {
            console.log("restarting game");
            //console.log(state[roomName]);
            state[roomName] = initGame(numClients);
        } else {
            //create starting state and food
            console.log("starting game")
            state[roomName] = initGame(numClients);
            //start game loop
            startGameInterval(roomName);
        }
        
        //clear out empty states
        for (var s in state) {
            //console.log(s);
            //console.log(io.sockets.adapter.rooms.has(s));
            if (state[s] === null || !io.sockets.adapter.rooms.has(s)) {
                delete state[s];
            }
        }
        console.log("Number of stored states: " + Object.keys(state).length);
    }

    function handleKeydown(keyCode) {
        const roomName = clientRooms[client.id];

        if (!roomName || !state[roomName]) {
            return;
        }

        try {
            keyCode = parseInt(keyCode);
        } catch (err){
            console.error(err);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);
        let player = state[roomName].players[client.number-1];
        if (vel) {
            player.vel = vel;
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

function emitGameState(roomName, gameState) {
    // Sending game state to everyone in room
    io.sockets.in(roomName)
      .emit('gameState', JSON.stringify(gameState));
}
  
function emitGameOver(room, winner) {
    io.sockets.in(room)
        .emit('gameOver', JSON.stringify({ winner }));
}


httpServer.listen(PORT);
