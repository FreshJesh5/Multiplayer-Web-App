const BG_COLOR = '#231f20';
const SNAKE_COLOR = '#c2c2c2';
const FOOD_COLOR = '#e66916';

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.querySelector('#gameScreen');
const initialScreen = document.querySelector('#initialScreen');
const newGameBtn = document.querySelector('#newGameButton');
const joinGameBtn = document.querySelector('#joinGameButton');
const gameCodeInput = document.querySelector('#gameCodeInput');
const gameCodeDisplay = document.querySelector('#gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);

function newGame() {
    socket.emit('newGame');
    init();
}

function joinGame() {
    console.log('emit joinGame');
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
    init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown',keydown);
    gameActive = true;
}

function keydown(e) {
    socket.emit('keydown', e.keyCode);
}

function paintGame(state) {
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    paintFood(state.food, size, FOOD_COLOR);

    paintPlayer(state.players[0], size, SNAKE_COLOR);
    paintPlayer(state.players[1], size, 'red');
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



function handleInit(number) {
    playerNumber = number;
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameState(gameState) {
    gameState = JSON.parse(gameState);
    requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);
    gameActive = false;
    if (data.winner == playerNumber) {
        alert("You win :)");
    } else {
        alert("You lose :(");
    }

}

function handleGameCode(gameCode) {
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
}
  
function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
}

function reset() {
    console.log('reset() called');
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
}