// Constants
const boardElement = document.getElementById('board');
const rows = 8;
const cols = 8;

// Game state
let board = [];
let selectedPiece = null;

// Initialize the board
function createBoard() {
  for (let row = 0; row < rows; row++) {
    const currentRow = [];
    for (let col = 0; col < cols; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
      cell.dataset.row = row;
      cell.dataset.col = col;

      // Add pieces to the board
      if ((row < 3 || row > 4) && (row + col) % 2 !== 0) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.classList.add(row < 3 ? 'red' : 'black');
        cell.appendChild(piece);
        currentRow.push({ piece: piece.classList.contains('red') ? 'red' : 'black', isKing: false });
      } else {
        currentRow.push(null);
      }

      cell.addEventListener('click', () => handleCellClick(row, col));
      boardElement.appendChild(cell);
    }
    board.push(currentRow);
  }
}

// Handle cell click
function handleCellClick(row, col) {
  const cell = board[row][col];

  if (selectedPiece) {
    // Attempt to move or capture with the selected piece
    if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
      movePiece(selectedPiece.row, selectedPiece.col, row, col);
    }
    selectedPiece = null;
  } else if (cell && cell.piece) {
    // Select the piece
    selectedPiece = { row, col };
  }
}

// Move a piece
function movePiece(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (!piece) return;

  // Check if the move is a capture
  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);
  const isCapture = rowDiff === 2 && colDiff === 2;

  if (isCapture) {
    // Calculate the position of the captured piece
    const capturedRow = (fromRow + toRow) / 2;
    const capturedCol = (fromCol + toCol) / 2;

    // Remove the captured piece from the board
    board[capturedRow][capturedCol] = null;
    const capturedCell = document.querySelector(`[data-row="${capturedRow}"][data-col="${capturedCol}"]`);
    capturedCell.innerHTML = '';
  }

  // Update the board state
  board[toRow][toCol] = piece;
  board[fromRow][fromCol] = null;

  // Update the DOM
  const fromCell = document.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
  const toCell = document.querySelector(`[data-row="${toRow}"][data-col="${toCol}"]`);
  toCell.appendChild(fromCell.firstChild);

  // Check for king promotion
  promoteToKing(toRow, toCol);
}

// Promote a piece to king
function promoteToKing(row, col) {
  const piece = board[row][col];
  if (!piece || piece.isKing) return;

  // Red pieces become kings on row 7, black pieces on row 0
  if ((piece.piece === 'red' && row === rows - 1) || (piece.piece === 'black' && row === 0)) {
    piece.isKing = true;

    // Add visual indication
    const pieceElement = document.querySelector(`[data-row="${row}"][data-col="${col}"] .piece`);
    pieceElement.classList.add('king');
  }
}

// Validate a move
function isValidMove(fromRow, fromCol, toRow, toCol) {
  const piece = board[fromRow][fromCol];
  if (!piece) return false;

  const rowDiff = Math.abs(toRow - fromRow);
  const colDiff = Math.abs(toCol - fromCol);

  // Ensure the target cell is empty
  if (board[toRow][toCol]) return false;

  // Check for basic moves (diagonal, one step)
  if (rowDiff === 1 && colDiff === 1) {
    // Regular pieces can only move forward
    if (!piece.isKing) {
      const direction = piece.piece === 'red' ? 1 : -1;
      return (toRow - fromRow) === direction;
    }
    return true; // Kings can move in any diagonal direction
  }

  // Check for captures (diagonal, two steps)
  if (rowDiff === 2 && colDiff === 2) {
    const capturedRow = (fromRow + toRow) / 2;
    const capturedCol = (fromCol + toCol) / 2;
    const capturedPiece = board[capturedRow][capturedCol];

    // Ensure there's an opponent's piece to capture
    if (capturedPiece && capturedPiece.piece !== piece.piece) {
      return true;
    }
  }

  return false;
}

// Start the game
createBoard();