const httpServer = require("http").createServer();
const io = require('socket.io')(httpServer, {
    cors: {
      origin: "http://127.0.0.1:8080",
      credentials: true
    }
});
const {createGameState, gameLoop, getUpdatedVelocity} = require('./game');
const {FRAME_RATE} = require('./constants');

io.on('connection', client => {
    client.emit('init', {data: "connected to server"});
    const state = createGameState();

    client.on('keydown', handleKeydown);

    function handleKeydown(keyCode) {
        try {
            keyCode = parseInt(keyCode);
        } catch (err){
            console.error(err);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);

        if (vel) {
            state.player.vel = vel;
        }
    }

    startGameInterval(client, state);
});

function startGameInterval(client, state) {
    const intervalId = setInterval(() => {
        const winner = gameLoop(state);

        if (!winner) {
            client.emit('gameState', JSON.stringify(state));
        } else {
            client.emit('gameOver');
            clearInterval(intervalId);
        }
    }, 1000 / FRAME_RATE);
}

httpServer.listen(3000);
