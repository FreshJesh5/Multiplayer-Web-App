const {GRID_SIZE} = require('./constants');

module.exports = {
    createGameState,
    gameLoop,
    getUpdatedVelocity
}

function createGameState() {
    return {
        player: {
            pos: {
                x: 3,
                y: 10
            },
            vel: {
                x: 1,
                y: 0
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10}
            ]
        },
        food: {
            x: 7,
            y: 7
        },
        gridsize: GRID_SIZE
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }
    const playerOne = state.player;

    //update position
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    //border collision check
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE ||
        playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        return 2;
    }
    //self collision check
    for (let c of playerOne.snake.slice(1)) {
        if (c.x === playerOne.pos.x && c.y === playerOne.pos.y) {
            return 2;
        }
    }
    //food check
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        playerOne.snake.push({...playerOne.pos});
        randomFood(state);
    } else if (playerOne.vel.x || playerOne.vel.y) { //update body
        playerOne.snake.push({...playerOne.pos});
        playerOne.snake.shift();
    }
}

function randomFood(state) {
    food = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
    }

    for (let c of state.player.snake) {
        if (c.x === food.x && c.y === food.y) {
            return randomFood(state);
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
    }
}