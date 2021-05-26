const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);

const gameScreen = document.querySelector('#gameScreen');

let canvas, ctx;

function init() {
    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown',keydown);
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

init();

function paintGame(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    paintFood(state.food, size, FOOD_COLOR);

    paintPlayer(state.player, size, SNAKE_COLOR);
}

function paintFood(foodState, size, color){
    ctx.fillStyle = color;
    ctx.fillRect(foodState.x * size, foodState.y * size, size, size);
}

function paintPlayer(playerState, size, color) {
    const snake = playerState.snake;
    ctx.fillStyle = color;
    for (let c of snake) {
        ctx.fillRect(c.x * size, c.y * size, size, size)
    }
}



function handleInit(msg) {
    console.log(msg);
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(){
    console.log("Game Over");
    alert("You lose :(");
}