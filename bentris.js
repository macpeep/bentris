
const pLong = [
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0],
  [0, 0, 1, 0]
];

const pRightEll = [
  [0, 2, 0],
  [0, 2, 0],
  [0, 2, 2]
];

const pLeftEll = [
  [0, 3, 0],
  [0, 3, 0],
  [3, 3, 0]
];

const pRightStep = [
  [0, 0, 0],
  [4, 4, 0],
  [0, 4, 4]
];

const pLeftStep = [
  [0, 0, 0],
  [0, 5, 5],
  [5, 5, 0]
];

const pSquare = [
  [6, 6],
  [6, 6]
];

const pTee = [
  [0, 0, 0],
  [7, 7, 7],
  [0, 7, 0]
];

const pieces = [
  pLong, pRightEll, pLeftEll, pRightStep, pLeftStep, pSquare, pTee
];

function getRandomPiece() {
  // pick a random number between 0 and number of pieces - 1 and
  // then return that piece from the pieces array
  const pNum = Math.floor(Math.random() * pieces.length);
  return pieces[pNum];
}

function createRotatedPiece(piece) {
  // rotate the piece 90 degrees to the left
  const newPiece = [];

  const pW = piece[0].length;
  const pH = piece.length;

  for (let y = 0; y < pH; y++) {
    const row = [];
    newPiece.push(row);
    for (let x = 0; x < pW; x++) {
      // rows become columns
      row.push(piece[x][pH - 1 - y]);
    }
  }

  return newPiece;
}

function createEmptyRow() {
  // create a row full of empty cells
  const gW = 10;

  const row = [];
  row.length = gW;
  row.fill(0);
  return row;
}

const emptyRow = createEmptyRow();

function createEmptyGrid() {
  // create an empty grid by adding empty rows to it
  const gH = 20;

  const rows = [];
  for (let y = 0; y < gH; y++) {
    rows.push(emptyRow);
  }
  return rows;
}

function isLegalPiecePosition(grid, piece, x, y) {
  // check if the piece is outside the grid or inside a dropped piece
  const gW = grid[0].length;
  const gH = grid.length;
  const pW = piece[0].length;
  const pH = piece.length;

  for (let pY = 0; pY < pH; pY++) {
    const gY = y + pY;
    for (let pX = 0; pX < pW; pX++) {
      if (piece[pY][pX]) {
        const gX = x + pX;

        if (gX < 0 || gX >= gW || gY >= gH) {
          // outside grid
          return false;
        }

        if (gY >= 0 && grid[gY][gX]) {
          // overlaps a dropped block
          return false;
        }
      }
    }
  }

  return true;
}

function isRowCompleted(row) {
  // return false if we find a cell that is not completed
  for (const cell of row) {
    if (!cell) {
      return false;
    }
  }
  return true;
}

function countCompletedRows(grid) {
  // go through each row in the grid and check if the row is completed
  let rowCount = 0;
  for (const row of grid) {
    if (isRowCompleted(row)) {
      rowCount++;
    }
  }
  return rowCount;
}

function clearCompletedRows(grid) {
  const newGrid = [];
  for (const row of grid) {
    if (isRowCompleted(row)) {
      // row is completed - add an empty row on the top
      newGrid.unshift(emptyRow);
    } else {
      // row is not completed - add it to the bottom
      newGrid.push(row);
    }
  }
  return newGrid;
}

function mergePieceWithGrid(grid, piece, x, y) {
  const newGrid = [];

  const gW = grid[0].length;
  const gH = grid.length;
  const pW = piece[0].length;
  const pH = piece.length;

  for (let gY = 0; gY < gH; gY++) {
    const row = grid[gY];
    if (gY < y || gY >= y + pH) {
      // above or below piece - copy row
      newGrid.push(row);
    } else {
      // on a row with piece - go through each cell and check if
      // it is a piece or grid cell and create new row
      const newRow = [];
      const pY = gY - y;

      for (let gX = 0; gX < gW; gX++) {
        const pX = gX - x;

        if (pX < 0 || pX >= pW || !piece[pY][pX]) {
          // left or right of piece, or empty cell in piece
          newRow.push(row[gX]);
        } else {
          // inside block part of piece
          newRow.push(piece[pY][pX]);
        }
      }

      newGrid.push(newRow);
    }
  }
  
  return newGrid;
}

function movePiece(dx, dy) {
  if (isLegalPiecePosition(grid, piece, pieceX + dx, pieceY + dy)) {
    // piece is legal in the new position
    pieceX += dx;
    pieceY += dy;
    return true;
  } else {
    return false;
  }
}

function rotatePiece(dir) {
  let rotatedPiece = piece;

  // each step rotates the piece 90 deg to the left
  let steps = 0;
  if (dir < 0) {
    // left rotation - one step
    steps = 1;
  } else if (dir > 0) {
    // right rotation - three steps
    steps = 3;
  }

  for (let i = 0; i < steps; i++) {
    rotatedPiece = createRotatedPiece(rotatedPiece);
  }

  if (isLegalPiecePosition(grid, rotatedPiece, pieceX, pieceY)) {
    // piece is legal with the new rotation
    piece = rotatedPiece;
    return true;
  } else {
    return false; 
  }
}

let gridRoot = null;
let gridCells = null;

function renderGrid(grid) {
  if (!gridRoot) {
    // first call to render - create the elements necessary
    // to render the grid
    gridRoot = document.getElementById('grid');
    gridCells = [];

    for (const row of grid) {
      // create the row
      const gridRow = document.createElement('div');
      gridRow.className = 'grid-row';
      gridRoot.appendChild(gridRow);
      const rowCells = [];
      gridCells.push(rowCells);

      for (const cell of row) {
        // create cells for this row
        const gridCell = document.createElement('div');
        gridRow.appendChild(gridCell);
        rowCells.push(gridCell);
      }
    }
  }

  const gW = grid[0].length;
  const gH = grid.length;

  // set the correct color of each cell
  for (let gY = 0; gY < gH; gY++) {
    for (let gX = 0; gX < gW; gX++) {
      const cellColor = grid[gY][gX];
      const cell = gridCells[gY][gX];
      cell.className = `grid-cell piece-${cellColor}`;
    }
  }
}

let scoreRoot = null;

function renderScore() {
  if (!scoreRoot) {
    scoreRoot = document.getElementById('score');
  }

  // render score
  scoreRoot.textContent = score;
}

function render() {
  let frameGrid;
  if (piece) {
    // we have a piece so we need to merge the piece at its current
    // position with the grid and render the result
    frameGrid = mergePieceWithGrid(grid, piece, pieceX, pieceY);
  } else {
    // no piece so we just need to render the grid
    frameGrid = grid;
  }
  renderGrid(frameGrid);
  
  // render score
  renderScore();
}

function gridToString(grid) {
  // X for block cells, O for empty cells
  let str = '';
  for (const row of grid) {
    for (const cell of row) {
      const cellStr = cell ? 'X' : 'O';
      str += cellStr;
    }
    str += '\n';
  }
  return str;
}

// key pressed and repeat states
let keyLeftPressed = false;
let keyLeftRepeat = false;
let keyRightPressed = false;
let keyRightRepeat = false;
let keyRotatePressed = false;
let keyRotateRepeat = false;
let keyDownPressed = false;
let keyDownRepeat = false;
let keyDropPressed = false;

// scheduled commands
let commandLeftAt = 0;
let commandRightAt = 0;
let commandRotateAt = 0;
let commandDownAt = 0;
let commandDropAt = 0;

function resetCommands() {
  // reset command variables
  keyLeftPressed = false;
  ketLeftRepeat = false;
  keyRightPressed = false;
  keyRightRepeat = false;
  keyRotatePressed = false;
  keyRotateRepeat = false;
  keyDownPressed = false;
  keyDownRepeat = false;
  keyDropPressed = false;

  commandLeftAt = 0;
  commandRightAt = 0;
  commandRotateAt = 0;
  commandDownAt = 0;
  commandDropAt = 0;
}

function handleCommands() {
  const now = Date.now();
  const noRepeatInterval = 250;
  const horizontalInterval = 100;
  const rotateInteraval = 250;
  const downInterval = 50;

  if (commandLeftAt && now >= commandLeftAt) {
    // move left
    movePiece(-1, 0);
    const interval = keyLeftRepeat ? horizontalInterval : noRepeatInterval;
    commandLeftAt = now + interval;
    keyLeftRepeat = true;
  }
  if (commandRightAt && now >= commandRightAt) {
    // move right
    movePiece(1, 0);
    const interval = keyRightRepeat ? horizontalInterval : noRepeatInterval;
    commandRightAt = now + interval;
    keyRightRepeat = true;
  }
  if (commandRotateAt && now >= commandRotateAt) {
    // rotate
    rotatePiece(-1);
    const interval = keyRotateRepeat ? rotateInteraval : noRepeatInterval;
    commandRotateAt = now + interval;
    keyRotateRepeat = true;
  }
  if (commandDownAt && now >= commandDownAt) {
    // move down
    movePiece(0, 1);
    const interval = keyDownRepeat ? downInterval : noRepeatInterval;
    commandDownAt = now + interval;
    keyDownRepeat = true;
  }
  if (commandDropAt && now >= commandDropAt) {
    // drop
    while (movePiece(0, 1));
    commandDropAt = 0;
  }
}

function onKeyEvent(key, pressed) {
  const now = Date.now();

  // map key events to commands
  if (key == 'ArrowLeft') {
    // move left
    if (keyLeftPressed != pressed) {
      keyLeftPressed = pressed;
      commandLeftAt = pressed ? now : 0;
      keyLeftRepeat = false;
    }
  } else if (key == 'ArrowRight') {
    // move right
    if (keyRightPressed != pressed) {
      keyRightPressed = pressed;
      commandRightAt = pressed ? now : 0;
      keyRightRepeat = false;
    }
  } else if (key == 'ArrowUp') {
    // rotate
    if (keyRotatePressed != pressed) {
      keyRotatePressed = pressed;
      commandRotateAt = pressed ? now : 0;
      keyRotateRepeat = false;
    }
  } else if (key == 'ArrowDown') {
    // move down
    if (keyDownPressed != pressed) {
      keyDownPressed = pressed;
      commandDownAt = pressed ? now : 0;
      moveDownAt = now + moveDownInterval;
      keyDownRepeat = false;
    }
  } else if (key == ' ') {
    // drop
    if (keyDropPressed != pressed) {
      keyDropPressed = pressed;
      commandDropAt = pressed ? now : 0;
    }
  }
}

function onKeyDown(event) {
  onKeyEvent(event.key, true);
  event.preventDefault();
}

function onKeyUp(event) {
  onKeyEvent(event.key, false);
  event.preventDefault();
}

// automatic move down
let moveDownAt = 0;
const maxSpeedDurationSecs = 10 * 60;
const minMoveDownInterval = 150;
const maxMoveDownInterval = 1000;
let moveDownInterval = maxMoveDownInterval;

function resetMoveDownCommand() {
  // reset automatic move down variables
  moveDownInterval = maxMoveDownInterval;
  moveDownAt = Date.now() + moveDownInterval;
}

function handleMoveDown() {
  const now = Date.now();

  // compute move down interval
  const gameDurationSecs = (now - startTime) / 1000;
  const ratio = Math.min(1, gameDurationSecs / maxSpeedDurationSecs);
  const moveDownSpeedup = (maxMoveDownInterval - minMoveDownInterval) * ratio;
  moveDownInterval = maxMoveDownInterval - moveDownSpeedup;

  if (moveDownAt && now >= moveDownAt) {
    // automatic move down
    const success = movePiece(0, 1);
    moveDownAt = now + moveDownInterval;
    return success;
  } else {
    return true;
  }
}

function spawnNewPiece() {
  // get a random piece
  const newPiece = getRandomPiece();

  const gW = grid[0].length;
  const pW = newPiece[0].length;

  // place piece in the center
  const newPieceX = Math.floor((gW - pW) / 2);

  // check if the first row of the piece is empty
  let emptyFirstRow = true;
  for (const cell of newPiece[0]) {
    if (cell) {
      emptyFirstRow = false;
      break;
    }
  }

  // place the piece at the top
  const newPieceY = emptyFirstRow ? -1 : 0;

  if (isLegalPiecePosition(grid, newPiece, newPieceX, newPieceY)) {
    // piece is legal in the new position
    piece = newPiece;
    pieceX = newPieceX;
    pieceY = newPieceY;
    return true;
  } else {
    return false;
  }
}

function handlePieceLanded() {
  // merge the current piece with the grid at its current location
  grid = mergePieceWithGrid(grid, piece, pieceX, pieceY);

  // increment score based on completed rows
  // 1 point for a landed piece
  // 100 points for each completed row
  score += 1 + (100 * countCompletedRows(grid));

  // clear completed rows
  grid = clearCompletedRows(grid);

  // spawn a new piece
  if (!spawnNewPiece()) {
    // not possible to spawn new piece - end game
    endGame();
  }  
}

let grid = null;
let piece = null;
let pieceX = null;
let pieceY = null;
let gameTimerId = null; 
let score = 0;
let startTime = 0;

function startGame() {
  // add keyboard event listeners
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  // reset score and record start time
  score = 0;
  startTime = Date.now();

  // create grid
  grid = createEmptyGrid();

  // spawn a piece
  spawnNewPiece();

  // reset command and move down variables
  resetCommands();
  resetMoveDownCommand();

  // start game timer
  gameTimerId = setInterval(onGameLoopTimerTick, 10);
}

function endGame() {
  // remove keyboard event listeners
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp); 

  // stop game timer
  clearInterval(gameTimerId);
  gameTimerId = null;
}

function onGameLoopTimerTick() {
  // handle user commands
  handleCommands();

  // handle automatic down movement
  if (!handleMoveDown()) {
    handlePieceLanded();
  }

  // render frame
  render();
}

function main() {
  document.title = 'Bentris';
  startGame();
}

window.addEventListener('load', main);
