const { GRID_SIZE } = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity,
    createGameState
}

function initGame(numClients) {
    const state = createGameState(numClients);
    randomFood(state);
    return state;
}

function createPlayers(numPlayers) {
    var middle = GRID_SIZE / 2;
    var arr = [
        {
            pos: { x: 2 , y: middle },
            vel: { x: 0, y: 0 },
            snake: [
                {x: 0, y: middle},
                {x: 1, y: middle},
                {x: 2, y: middle}
            ],
            alive: true
        },
        {
            pos: { x: 17, y: middle },
            vel: { x: 0, y: 0 },
            snake: [
                {x: 19, y: middle},
                {x: 18, y: middle},
                {x: 17, y: middle}
            ],
            alive: true
        },
        {
            pos: { x: middle, y: 2  },
            vel: { x: 0, y: 0 },
            snake: [
                {x: middle, y: 0},
                {x: middle, y: 1},
                {x: middle, y: 2}
            ],
            alive: true
        },
        {
            pos: { x: middle, y: 17 },
            vel: { x: 0, y: 0 },
            snake: [
                {x: middle, y: 19},
                {x: middle, y: 18},
                {x: middle, y: 17}
            ],
            alive: true
        }
    ];
    arr = arr.slice(0,numPlayers);
    return arr;
}

function createGameState(numPlayers) {
    return {
        players: createPlayers(numPlayers),
        food: {},
        gridsize: GRID_SIZE,
        active: true,
        numPlayers: numPlayers
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }

    let foodEaten = false;
    for (var i = 0; i < state.numPlayers; i++) {
        const player = state.players[i];
        if (!player) {
            throw "Player " + i + " is null";
        }
        //update position
        player.pos.x += player.vel.x;
        player.pos.y += player.vel.y;
        //border collision check
        if (player.pos.x < 0 || player.pos.x >= GRID_SIZE ||
            player.pos.y < 0 || player.pos.y >= GRID_SIZE) {
            //console.log('player OOB');
            if (player.alive) {
                killPlayer(state, i);
            }
        }
        //self collision check
        for (let c of player.snake.slice(1,-1)) {
            if (c.x === player.pos.x && c.y === player.pos.y) {
                //console.log('player self collide');
                if (player.alive) {
                    killPlayer(state, i);
                }
            }
        }
        //food check and update body movement
        if (state.food.x === player.pos.x && state.food.y === player.pos.y) {
            foodEaten = true;
            player.snake.push({...player.pos});
        } else if (player.vel.x || player.vel.y) { //update body movement
            player.snake.push({...player.pos});
            player.snake.shift();
        }
    }

    //if only one player alive, declare winner
    //if all dead, all lost
    let alivePlayers = state.players.filter(p => p.alive);
    if (state.numPlayers === 1) {
        if (alivePlayers.length === 0) {
            return -1;
        }
    } else {
        if (alivePlayers.length === 1) {
            return state.players.findIndex(p => p.alive)+1;
        } else if (alivePlayers.length === 0) {
            return -1;
        }
    }

    //randomly generate food if eaten
    if (foodEaten) {
        randomFood(state);
    }
}

function killPlayer (state, i) {
    console.log("Player "+(i+1)+" died");
    state.players[i] = {
        pos: { x: -1 , y: -1 },
        vel: { x: 0, y: 0 },
        snake: [],
        alive: false
    }
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    }
    //food and player overlap check
    for (var i = 0; i < state.numPlayers; i++) {
        for (let c of state.players[i].snake) {
            if (c.x === food.x && c.y === food.y) {
                return randomFood(state);
            }
        }
    }

    state.food = food;
}

function getUpdatedVelocity(keycode, player) {
    switch (keycode) {
        case 37: { //left
            if (player.vel.x == 1 && player.vel.y == 0) return;
            return {x: -1, y: 0};
        }
        case 38: { //down
            if (player.vel.x == 0 && player.vel.y == 1) return;
            return {x: 0, y: -1};
        }
        case 39: { //right
            if (player.vel.x == -1 && player.vel.y == 0) return;
            return {x: 1, y: 0};
        }
        case 40: { //up
            if (player.vel.x == 0 && player.vel.y == -1) return;
            return {x: 0, y: 1};
        }
        case 80: { //space
            return {x: 0, y: 0};
        }
    }
}