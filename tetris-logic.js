let canvas = document.getElementById("gridCanvas");
let gridCtx = canvas.getContext("2d");

let nextTetrimino = document.getElementById("nextTetrimino");
let nextCtx = nextTetrimino.getContext("2d");

let rightContainer = document.getElementsByClassName("right-container");

var animationId;
var playButton = document.querySelector("#play");
var score = document.querySelector("#score-text");
var levelElement = document.querySelector("#level");
var nextTetriminoDiv = document.querySelector("#next-container");

const audio_beep = document.querySelector("#beep");
const audio_oneline = document.querySelector("#oneline");
const audio_fourlines = document.querySelector("#fourlines");
const audio_gameover = document.querySelector("#gameover");

rightContainer[0].style.width = "152px";
rightContainer[0].style.height = gridBlockSize * rows + "px";

gridCtx.canvas.width = gridBlockSize * columns;
gridCtx.canvas.height = gridBlockSize * rows;

moves = {
  down: (bp) => ({ ...bp, y: bp.y + 1 }),
  left: (bp) => ({ ...bp, x: bp.x - 1 }),
  right: (bp) => ({ ...bp, x: bp.x + 1 }),
  up: (bp) => board.rotate(bp),
};

function moveDown() {
  if (frameCount - downFC > gameSpeed && !isGameOver && !isGameWon) {
    downFC = frameCount;
    bp = board.piece;
    p = moves.down(bp);
    if (board.piece.reachedEnd(p)) {
      board.piece.freeze(p);
      board.getNewTetrimino();
    } else {
      board.piece.moveTetrimino(p);
    }
    board.drawTetrimino();
  }
}

var keyHandler = function keyDownHandler(e) {
  bp = board.piece;
  if (e.key == "ArrowUp" || e.key == "x" || e.key == '1' || e.key == '5' || e.key == '9') {
    bp = moves.up(bp);
    if (board.piece.reachedEnd(bp) == 0) {
      board.piece.moveTetrimino(bp);
      board.drawTetrimino();
    }
  } else if (e.key == "ArrowDown" || e.key == " " || e.key == '8') {
    p = moves.down(bp);

    if (board.piece.reachedEnd(p)) {
      board.piece.freeze(p);
      board.getNewTetrimino();
    } else {
      board.piece.moveTetrimino(p);
    }
    board.drawTetrimino();
  } else if (e.key == "ArrowRight" || e.key == '6') {
    p = moves.right(bp);
    if (board.piece.moveTetrimino(p)) {
      if (board.piece.reachedEnd(p)) {
        board.piece.freeze(p);
        board.getNewTetrimino();
      }
    }
    board.drawTetrimino();
  } else if (e.key == "ArrowLeft" || e.key == '4') {
    p = moves.left(bp);
    if (board.piece.moveTetrimino(p)) {
      if (board.piece.reachedEnd(p)) {
        board.piece.freeze(p);
        board.getNewTetrimino();
      }
    }
    board.drawTetrimino();
  }
};

async function gameOver(text) {
  cancelAnimationFrame(animationId);
  gridCtx.save();
  gridCtx.fillStyle = "rgba(1,1,1, 0.5)";
  gridCtx.fillRect(0, 0, canvas.width, canvas.height);
  gridCtx.restore();
  gridCtx.font = "30px Chelsea Market";
  gridCtx.textAlign = "center";
  gridCtx.fillText(text, canvas.width / 2, canvas.height / 2);
  playButton.textContent = "Play";
  document.removeEventListener("keydown", keyHandler);
  mobile__contorls.removeEventListener("click", mediaEventHandler);
}

//################################################################################# main
let board;
function playButtonHandler() {
  if (playButton.textContent == "Play") {
    resetGame();
    playButton.textContent = "Pause";
    board = new Board(gridCtx);
    well = board.boardEmptied();
    document.addEventListener("keydown", keyHandler);
    mobile__contorls.addEventListener("click", mediaEventHandler);
    animate();
  } else if (playButton.textContent == "Pause") {
    pauseGame();
  } else if (playButton.textContent == "Resume") {
    resumeGame();
  }
}

async function animate() {
  frameCount++;
  gridCtx.clearRect(0, 0, canvas.width, canvas.height);
  moveDown();
  board.drawTetrimino();
  if (isGameOver) {
    audio_gameover.play();
    gameOver("Game Over");
  }
  if (isGameWon) {
    gameOver("You Won");
  }
  if (levelIncreased) {
    levelIncreased = false;
    await drawLevels(currentLevel);
  }
  if (isGameStarting) {
    isGameStarting = false;
    await gameStartingCountdown();
  }
  if (!isGameOver) {
    animationId = requestAnimationFrame(animate);
  }
}

function resetGame() {
  frameCount = 0;
  isGameWon = false;
  downFC = 0;
  isGameOver = false;
  score.textContent = 0;
  levelElement.textContent = 1;
  gridCtx.clearRect(0, 0, canvas.width, canvas.height);
  well = null;
  board = null;
  linesCleared = 0;
  gameSpeed = 55;
  currentTetrimino = null;
  incomingTetrimino = null;
  cancelAnimationFrame(animationId);
  tetrisCount = 0;
  currentLevel = 1;
  levelIncreased = false;
  isGameStarting = true;
  generatedBlocksCount = 0;
}

function pauseGame() {
  playButton.textContent = "Resume";
  cancelAnimationFrame(animationId);
  document.removeEventListener("keydown", keyHandler);
  mobile__contorls.removeEventListener("click", mediaEventHandler);
  gridCtx.save();
  gridCtx.fillStyle = "rgba(0,0,0, 0.5)";
  gridCtx.fillRect(0, 0, canvas.width, canvas.height);
  gridCtx.restore();
  gridCtx.font = "30px Chelsea Market";
  gridCtx.textAlign = "center";
  gridCtx.fillText("Paused", canvas.width / 2, canvas.height / 2);
}

function resumeGame() {
  playButton.textContent = "Pause";
  animate();
  document.addEventListener("keydown", keyHandler);
  mobile__contorls.addEventListener("click", mediaEventHandler);
}

playButton.addEventListener("click", playButtonHandler);

function mediaFunction(media) {
  if (media.matches) {
    // If media query matches
    nextTetriminoDiv.style.height = "25%";
    var mobile__contorls = document.querySelector("#mobile__contorls");
  }
}

function mediaEventHandler() {
  event.preventDefault();
  let tId = event.target.parentElement.id;
  let Id = event.target.id;
  bp = board.piece;

  if (tId == "rotate" || Id == "rotate") {
    bp = moves.up(bp);
    if (board.piece.reachedEnd(bp) == 0) {
      board.piece.moveTetrimino(bp);
      board.drawTetrimino();
    }
  }
  if (tId == "left-nav" || Id == "left-nav") {
    p = moves.left(bp);
    if (board.piece.moveTetrimino(p)) {
      if (board.piece.reachedEnd(p)) {
        board.piece.freeze(p);
        board.getNewTetrimino();
      }
    }
    board.drawTetrimino();
  }
  if (tId == "right-nav" || Id == "right-nav") {
    p = moves.right(bp);
    if (board.piece.moveTetrimino(p)) {
      if (board.piece.reachedEnd(p)) {
        board.piece.freeze(p);
        board.getNewTetrimino();
      }
    }
    board.drawTetrimino();
  }
  if (tId == "down" || Id == "down") {
    p = moves.down(bp);

    if (board.piece.reachedEnd(p)) {
      board.piece.freeze(p);
      board.getNewTetrimino();
    } else {
      board.piece.moveTetrimino(p);
    }
    board.drawTetrimino();
  }
}

var media = window.matchMedia("(max-width: 600px)");
mediaFunction(media); // Call listener function at run time
media.addListener(mediaFunction);

//########################################################## next canvas
nextCtx.canvas.height = gridBlockSize * 4;
nextCtx.canvas.width = "150";

function drawRules() {
  gridCtx.fillStyle = "white";
  gridCtx.textAlign = "center";
  gridCtx.font = "30px Chelsea Market";
  gridCtx.fillText("Click Play", canvas.width / 2, 170);
  gridCtx.fillText("To Start", canvas.width / 2, 210);
  nextCtx.fillStyle = "black";
  nextCtx.font = "15px Chelsea Market";
  nextCtx.fillText("This shows the", 20, 30);
  nextCtx.fillText("next Tetrimino", 20, 50);
}

async function drawLevels(level) {
  document.removeEventListener("keydown", keyHandler);
  mobile__contorls.removeEventListener("click", mediaEventHandler);

  gridCtx.clearRect(0, 0, canvas.width, canvas.height);
  gridCtx.fillStyle = "white";
  gridCtx.textAlign = "center";
  gridCtx.font = "60px Chelsea Market";
  gridCtx.fillText(`Level ${level}`, canvas.width / 2, canvas.height / 2);
  await sleep(2000);

  document.removeEventListener("keydown", keyHandler);
  mobile__contorls.removeEventListener("click", mediaEventHandler);
}

async function gameStartingCountdown() {
  document.removeEventListener("keydown", keyHandler);
  mobile__contorls.removeEventListener("click", mediaEventHandler);

  for (let i = 3; i > 0; i--) {
    gridCtx.clearRect(0, 0, canvas.width, canvas.height);
    gridCtx.fillStyle = "white";
    gridCtx.textAlign = "center";
    gridCtx.font = "60px Chelsea Market";
    gridCtx.fillText(`${i}`, canvas.width / 2, canvas.height / 2);
    await sleep(1000);
  }

  document.addEventListener("keydown", keyHandler);
  mobile__contorls.addEventListener("click", mediaEventHandler);
}

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("load", drawRules);
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
