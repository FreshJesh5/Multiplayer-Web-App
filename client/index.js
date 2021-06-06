const BG_COLOR = '#231f20';
const SNAKE_COLOR = ['yellow', 'red', 'green', 'blue'];
const FOOD_COLOR = '#e66916';

const socket = io('http://localhost:3000');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('gameInSession', handleGameInSession);
socket.on('gameActive', handleGameActive);

const gameScreen = document.querySelector('#gameScreen');
const initialScreen = document.querySelector('#initialScreen');
const newGameBtn = document.querySelector('#newGameButton');
const joinGameBtn = document.querySelector('#joinGameButton');
const gameCodeInput = document.querySelector('#gameCodeInput');
const gameCodeDisplay = document.querySelector('#gameCodeDisplay');
const startGameBtn = document.querySelector('#startGameButton');
const colorBox = document.querySelector('#colorBox');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
startGameBtn.addEventListener('click', startGame);

let canvas, ctx;
let playerNumber;
let numPlayers;
let roomName;
let gameActive = false;

function newGame() {
    socket.emit('newGame');
}

function joinGame() {
    console.log('emit joinGame');
    const code = gameCodeInput.value;
    socket.emit('joinGame', code);
}

function startGame() {
    if (roomName) {
        socket.emit('startGame', roomName);
        startGameBtn.innerText = "Restart";
    } else {
        alert("Invalid game code");
    }
}



//create blank game screen
function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";

    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 600;

    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    document.addEventListener('keydown',keydown);
}

function handleGameActive(numClients) {
    numPlayers = numClients;
    console.log(numPlayers);
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

    for (var i = 0; i < numPlayers; i++) {
        paintPlayer(state.players[i], size, SNAKE_COLOR[i]);
    }
}

function paintFood(foodState, size, color){
    if (!foodState) {
        return;
    }
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
    init();
    playerNumber = number;
    colorBox.style.backgroundColor = SNAKE_COLOR[number-1];
    colorBox.style.width = colorBox.style.height ='30px';
}

function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
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
    roomName = gameCode;
    gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
    reset();
    alert('Unknown Game Code')
}
  
function handleTooManyPlayers() {
    reset();
    alert('This game room is full');
}

function handleGameInSession() {
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