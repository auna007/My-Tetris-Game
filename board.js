class Board {
  gridCtx;
  well;
  piece;

  constructor(gridCtx) {
    this.gridCtx = gridCtx;
    this.getNewTetrimino();
  }
  boardEmptied() {
    return Array.from({ length: rows }, () => Array(columns).fill(0));
  }
  getNewTetrimino() {
    if (!incomingTetrimino) {
      currentTetrimino = new Piece(this.gridCtx);
      incomingTetrimino = new Piece(this.gridCtx);
      this.piece = currentTetrimino;
    } else {
      currentTetrimino = incomingTetrimino;
      this.piece = currentTetrimino;
      incomingTetrimino = new Piece(this.gridCtx);
    }
  }

  drawTetrimino() {
    this.drawGridLines();
    this.piece.drawTetrimino();
    this.piece.drawNext(incomingTetrimino);
    this.drawBoard();
  }

  drawGridLines() {
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        this.gridCtx.fillStyle = "rgba(0,0,0,0.5)";
        this.gridCtx.fillRect(
          x * gridBlockSize,
          y * gridBlockSize,
          singleGridBlockSize,
          singleGridBlockSize
        );
      }
    }
  }

  drawBoard() {
    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        if (well[y][x] > 0) {
          gridCtx.fillStyle = colors[well[y][x]];
          gridCtx.fillRect(
            x * gridBlockSize,
            y * gridBlockSize,
            singleGridBlockSize,
            singleGridBlockSize
          );
        }
      }
    }
    this.isGameTerminate();
    this.isLineFull();
  }

  isLineFull() {
    let lines = [];
    for (let x = 0; x < rows; x++) {
      let isComp = true;
      for (let y = 0; y < columns; y++) {
        if (well[x][y] == 0) {
          isComp = false;
        }
      }
      if (isComp) lines.push(x);
    }

    // if a line is cleared
    if (lines.length > 0) {
      linesCleared++;
      for (let k = 0; k < lines.length; k++) {
        well.splice(lines[k], 1);
        well.unshift(Array(columns).fill(0));
      }

      // play audio when line cleared audio
      if (lines.length == 4) {
        audio_fourlines.currentTime = 0;
        audio_fourlines.play();
      } else {
        //play oneline one
        audio_oneline.currentTime = 0;
        audio_oneline.play();
      }

      if (lines.length == 4) {
        score.textContent = parseInt(score.textContent) + fixedScores[4];
        tetrisCount++;
        if (tetrisCount == levelTargets.level1.tcount && currentLevel == 1) {
          gameSpeed = levelsSpeed[1];
          levelElement.textContent = parseInt(levelElement.textContent) + 1;
          currentLevel++;
          levelIncreased = true;
        }
        if (tetrisCount == levelTargets.level2.tcount && currentLevel == 2) {
          gameSpeed = levelsSpeed[2];
          levelElement.textContent = parseInt(levelElement.textContent) + 1;
          currentLevel++;
          levelIncreased = true;
        }
        if (tetrisCount == levelTargets.level3.tcount && currentLevel == 3) {
          gameSpeed = levelsSpeed[3];
          levelElement.textContent = parseInt(levelElement.textContent) + 1;
          currentLevel++;
          levelIncreased = true;
        }
      } else {
        //increase score
        score.textContent =
          parseInt(score.textContent) + fixedScores[lines.length];
      }

      //changing level based on score
      let intScore = parseInt(score.textContent);
      if (intScore >= levelTargets.level1.score && currentLevel == 1) {
        gameSpeed = levelsSpeed[1];
        levelElement.textContent = parseInt(levelElement.textContent) + 1;
        currentLevel++;
        levelIncreased = true;
      }
      if (intScore >= levelTargets.level2.score && currentLevel == 2) {
        gameSpeed = levelsSpeed[2];
        levelElement.textContent = parseInt(levelElement.textContent) + 1;
        currentLevel++;
        levelIncreased = true;
      }
      if (intScore >= levelTargets.level3.score && currentLevel == 3) {
        gameSpeed = levelsSpeed[3];
        levelElement.textContent = parseInt(levelElement.textContent) + 1;
        currentLevel++;
        levelIncreased = true;
      }

      //game won
      if (
        (tetrisCount >= levelTargets.level4.tcount ||
          parseInt(score.textContent) >= levelTargets.level4.score) &&
        currentLevel == 4
      ) {
        isGameWon = true;
      }
    }
    return 1;
  }

  rotate(piece) {
    // Clone with JSON for immutability.
    let p = JSON.parse(JSON.stringify(piece));

    // Transpose matrix
    for (let y = 0; y < p.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [p.shape[x][y], p.shape[y][x]] = [p.shape[y][x], p.shape[x][y]];
      }
    }

    // Reverse the order of the columns.
    p.shape.forEach((row) => row.reverse());
    return p;
  }

  isGameTerminate() {
    let sum;
    sum = well[1].reduce((a, b) => a + b, 0);
    if (sum > 0) {
      isGameOver = true;
    }
  }
}
