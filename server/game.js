const {GRID_SIZE} = require('./constants');

module.exports = {
    initGame,
    gameLoop,
    getUpdatedVelocity
}

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}

function createGameState() {
    return {
        players: [{
            pos: {
                x: 3,
                y: 10
            },
            vel: {
                x: 0,
                y: 0
            },
            snake: [
                {x: 1, y: 10},
                {x: 2, y: 10},
                {x: 3, y: 10}
            ]
        }, {
            pos: {
                x: 18,
                y: 10
            },
            vel: {
                x: 0,
                y: 0
            },
            snake: [
                {x: 20, y: 10},
                {x: 19, y: 10},
                {x: 18, y: 10}
            ]
        }],
        food: {},
        gridsize: GRID_SIZE,
        active: true
    };
}

function gameLoop(state) {
    if (!state) {
        return;
    }
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    //update position
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;

    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    //border collision check
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE ||
        playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
        console.log('player1 OOB');
        return 2;
    }
    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE ||
        playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
        console.log('player2 OOB');
        return 1;
    }
    //self collision check
    for (let c of playerOne.snake.slice(1,-1)) {
        if (c.x === playerOne.pos.x && c.y === playerOne.pos.y) {
            console.log('player1 self collide');
            return 2;
        }
    }
    for (let c of playerTwo.snake.slice(1,-1)) {
        if (c.x === playerTwo.pos.x && c.y === playerTwo.pos.y) {
            console.log('player2 self collide');
            return 1;
        }
    }
    //food check and update body movement
    let foodEaten = false;
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        foodEaten = true;
        playerOne.snake.push({...playerOne.pos});
    } else if (playerOne.vel.x || playerOne.vel.y) { //update body movement
        playerOne.snake.push({...playerOne.pos});
        playerOne.snake.shift();
    }

    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        foodEaten = true;
        playerTwo.snake.push({...playerTwo.pos});
    } else if (playerTwo.vel.x || playerTwo.vel.y) { //update body movement
        playerTwo.snake.push({...playerTwo.pos});
        playerTwo.snake.shift();
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

    for (let c of state.players[0].snake) {
        if (c.x === food.x && c.y === food.y) {
            return randomFood(state);
        }
    }

    for (let c of state.players[1 ].snake) {
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