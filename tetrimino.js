const columns = 10;
const rows = 21;

var isGameStarting = true;
var isGameWon = false;
var isGameOver = false;
var levelIncreased = false;

const gridBlockSize = 22;
const singleGridBlockSize = 20;

var well;
var frameCount = 0;
let downFC = 0;
var score = 0;

var tetrisCount = 0;
var currentLevel = 1;
var generatedBlocksCount = 0;

var gameSpeed = 65; //initial speed is 65
var linesCleared = 0;

var currentTetrimino = null;
var incomingTetrimino = null;

const iTetrimino = [
  [1, 1, 1, 1],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

const jTetrimino = [
  [2, 0, 0],
  [2, 2, 2],
  [0, 0, 0],
];

const lTetrimino = [
  [0, 0, 3],
  [3, 3, 3],
  [0, 0, 0],
];

const oTetrimino = [
  [4, 4],
  [4, 4],
];

const sTetrimino = [
  [0, 5, 5],
  [5, 5, 0],
  [0, 0, 0],
];

const tTetrimino = [
  [6, 6, 6],
  [0, 6, 0],
  [0, 0, 0],
];

const zTetrimino = [
  [7, 7, 0],
  [0, 7, 7],
  [0, 0, 0],
];

const tetriminos = [
  [],
  iTetrimino,
  jTetrimino,
  lTetrimino,
  oTetrimino,
  sTetrimino,
  tTetrimino,
  zTetrimino,
];

const fixedScores = [0, 40, 100, 300, 1200];

const levelsSpeed = [0, gameSpeed - 20, gameSpeed - 30, gameSpeed - 40];

const levelTargets = {
  level1: { tcount: 1, score: 1200 },
  level2: { tcount: 3, score: 3600 },
  level3: { tcount: 5, score: 6000 },
  level4: { tcount: 10, score: 12000 },
};

const colors = [
  "none",
  "cyan",
  "blue",
  "orange",
  "yellow",
  "green",
  "purple",
  "red",
];

class Piece {
  x;
  y;
  color;
  shape;
  gridCtx;
  id;
  rBottom;

  constructor(gridCtx) {
    this.gridCtx = gridCtx;
    this.spawnTetrimino();
    this.x = 3;
    this.y = 0;
    this.rBottom = 0;
  }

  spawnTetrimino() {
    this.id = this.generateRandom(colors.length - 1);
    this.shape = tetriminos[this.id];
    this.color = colors[this.id];
  }

  drawTetrimino() {
    this.gridCtx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          gridCtx.fillRect(
            this.x * gridBlockSize + x * gridBlockSize,
            this.y * gridBlockSize + y * gridBlockSize,
            singleGridBlockSize,
            singleGridBlockSize
          );
        }
      });
    });
  }

  drawNext(Piece) {
    let offset = gridBlockSize * 2;
    let offsetY = gridBlockSize * 1;
    nextCtx.clearRect(0, 0, nextTetrimino.width, nextTetrimino.height);
    nextCtx.fillStyle = Piece.color;
    Piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          nextCtx.fillRect(
            offset + x * gridBlockSize,
            offsetY + y * gridBlockSize,
            singleGridBlockSize,
            singleGridBlockSize
          );
        }
      });
    });
  }

  moveTetrimino(p) {
    if (this.validLeftRight(p)) {
      if (this.validRightLeftTetriminos(p)) {
        this.x = p.x;
        this.y = p.y;
        this.shape = p.shape;
        return true;
      }
    }
    audio_beep.play()
    return false;
  }

  generateRandom(max) {
    generatedBlocksCount++;
    if (generatedBlocksCount % 20 == 0) return 1;
    return Math.floor(Math.random() * max + 1);
  }

  validLeftRight(p) {
    let leftX,
      rightX = 0,
      leftY = -1;
    for (let col = 0; col < p.shape[0].length; col++) {
      let sum = 0;
      for (let row = 0; row < p.shape.length; row++) {
        sum += p.shape[row][col];
        if (p.shape[row][col] > 0 && leftY < 0) leftY = row;
      }
      if (sum > 0) {
        leftX = col;
        break;
      }
    }
    for (let col = p.shape[0].length - 1; col >= 0; col--) {
      let sum = 0;
      for (let row = 0; row < p.shape.length; row++) {
        sum += p.shape[row][col];
      }
      if (sum > 0) {
        rightX++;
      }
    }

    if (p.x + leftX < 0 || p.x + leftX + rightX > columns) return false;
    return true;
  }
  freeze(p) {
    p.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          well[p.y + y][p.x + x] = value;
        }
      });
    });
  }

  validRightLeftTetriminos(p) {
    let leftPoints = [];
    let rightPoints = [];
    for (let row = 0; row < p.shape.length; row++) {
      for (let col = 0; col < p.shape[row].length; col++) {
        if (p.shape[row][col] > 0) {
          leftPoints.push([p.x + col, p.y + row]);
          break;
        }
      }
    }
    for (let row = 0; row < p.shape.length; row++) {
      for (let col = p.shape[row].length - 1; col >= 0; col--) {
        if (p.shape[row][col] > 0) {
          rightPoints.push([p.x + col, p.y + row]);
          break;
        }
      }
    }

    for (const item of leftPoints) {
      if (well[item[1]][item[0]] > 0) {
        return false;
      }
    }
    for (const item of rightPoints) {
      if (well[item[1]][item[0]] > 0) {
        return false;
      }
    }
    return true;
  }

  reachedEnd(t) {
    for (let i = t.shape.length - 1; i >= 0; i--) {
      const element = t.shape[i];
      const sum = element.reduce((a, b) => a + b, 0);
      if (sum > 0) {
        if (t.y + i + 1 >= rows) {
          audio_beep.play()
          return 1;
        }

        let currentY;
        currentY = t.y + i;
        for (let k = 0; k < element.length; k++) {
          if (element[k] > 0) {
            if (well[currentY + 1][t.x + k] > 0) {
              audio_beep.play()
              return 1;
            }
          }
        }
      }
    }
    return 0;

  }
}
