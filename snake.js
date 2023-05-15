const CFG = {
  blockSize: 16,
  gameLoopSpeed: 100,
  scoreValue: 50,

  headColor: '#FFFFFF',
  bodyColor: '#A0A0A0',
  tailColor: '#606060',
  foodColor: '#FF0000'
};

const scoreNode = document.getElementById('score');
const recordNode = document.getElementById('record');
const gameOverNode = document.getElementById('game-over');
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let food = {};
let score = 0;
let record = 0;
let snake = [{x: 0, y: 0}];
let direction = 'right';
let gameIsOver = false;
let gameIsPaused = false;

gameStart();

function createFood() {
  const positions = [];
  for (let x = 0; x < canvas.width; x += CFG.blockSize) {
    for (let y = 0; y < canvas.height; y += CFG.blockSize) {
      positions.push({ x, y });
    }
  }

  snake.forEach(segment => {
    positions.splice(positions.findIndex(pos => pos.x === segment.x && pos.y === segment.y), 1);
  });

  const randomIndex = Math.floor(Math.random() * positions.length);
  food = positions[randomIndex];
}

function drawActors() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawFood();
  drawSnake();

  function drawFood() {
    ctx.fillStyle = CFG.foodColor;
    ctx.fillRect(food.x, food.y, CFG.blockSize, CFG.blockSize);
  }

  function drawSnake() {
    let i = -1;
    snake.forEach((segment) => {
      i++;
      ctx.fillStyle = i === 0 ? CFG.headColor : (i === (snake.length - 1) ? CFG.tailColor : CFG.bodyColor);
      ctx.fillRect(segment.x, segment.y, CFG.blockSize, CFG.blockSize);
    });
  }
}

function moveSnake() {
  const head = {x: snake[0].x, y: snake[0].y};

  switch (direction) {
    case 'up':
      head.y -= CFG.blockSize;
      break;
    case 'down':
      head.y += CFG.blockSize;
      break;
    case 'left':
      head.x -= CFG.blockSize;
      break;
    case 'right':
      head.x += CFG.blockSize;
      break;
  }

  snake.unshift(head);
  if (head.x === food.x && head.y === food.y) {
    createFood();
    score += CFG.scoreValue;
  } else {
    snake.pop();
  }
}

function changeDirection(event) {
  switch (event.keyCode) {
    case 37:
      if (direction !== 'right') direction = 'left';
      break;
    case 38:
      if (direction !== 'down') direction = 'up';
      break;
    case 39:
      if (direction !== 'left') direction = 'right';
      break;
    case 40:
      if (direction !== 'up') direction = 'down';
      break;
    case 80:
      if (gameIsPaused === true) {
        gameIsPaused = false;
        gameLoop();
      } else {
        gameIsPaused = true;
      }
      break;
  }
}

function checkCollision() {
  if (
    snake[0].x < 0 ||
    snake[0].x >= canvas.width ||
    snake[0].y < 0 ||
    snake[0].y >= canvas.height
  ) {
    gameEnd();
    return;
  }

  if (snake.length < 4) {
    return;
  }

  for (let i = 1; i < snake.length; i++) {
    if (snake[0].x === snake[i].x && snake[0].y === snake[i].y) {
      gameEnd();
      return;
    }
  }
}

function updateScore() {
  record = parseInt(localStorage.getItem('record') || 0);
  recordNode.textContent = '' + record;
  if (score > record) {
    record = score;
    recordNode.textContent = '' + score;
    localStorage.setItem('record', score);
  }
  scoreNode.textContent = '' + score;
}

function gameLoop() {
  if (gameIsOver || gameIsPaused) {
    return;
  }

  drawActors();
  moveSnake();
  checkCollision();
  updateScore();

  setTimeout(gameLoop, CFG.gameLoopSpeed);
}

function gameStart() {
  document.addEventListener('keydown', changeDirection);
  createFood();
  gameLoop();
}

function gameEnd() {
  gameIsOver = true;
  setTimeout(function () {
    if (score > CFG.scoreValue && score === record) {
      let newRecordNode = document.createElement('SPAN');
      newRecordNode.textContent = 'NEW RECORD!!';
      newRecordNode.style.color = 'red';
      gameOverNode.appendChild(newRecordNode);
    }
    gameOverNode.classList.toggle('active');
    gameOverNode.querySelector('button').focus();
  }, 15);
}
