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
            ]
        },
        {
            pos: { x: 17, y: middle },
            vel: { x: 0, y: 0 },
            snake: [
                {x: 19, y: middle},
                {x: 18, y: middle},
                {x: 17, y: middle}
            ]
        },
        {
            pos: { x: middle, y: 2  },
            vel: { x: 0, y: 0 },
            snake: [
                {x: middle, y: 0},
                {x: middle, y: 1},
                {x: middle, y: 2}
            ]
        },
        {
            pos: { x: middle, y: 17 },
            vel: { x: 0, y: 0 },
            snake: [
                {x: middle, y: 19},
                {x: middle, y: 18},
                {x: middle, y: 17}
            ]
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
            //console.log('player1 OOB');
            return 2;
        }
        //self collision check
        for (let c of player.snake.slice(1,-1)) {
            if (c.x === player.pos.x && c.y === player.pos.y) {
                //console.log('player1 self collide');
                return 2;
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

    //randomly generate food if eaten
    if (foodEaten) {
        randomFood(state);
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

function getUpdatedVelocity(keycode) {
    switch (keycode) {
        case 37: { //left
            return {x: -1, y: 0};
        }
        case 38: { //down
            return {x: 0, y: -1};
        }
        case 39: { //right
            return {x: 1, y: 0};
        }
        case 40: { //up
            return {x: 0, y: 1};
        }
        case 80: { //p
            return {x: 0, y: 0};
        }
    }
}