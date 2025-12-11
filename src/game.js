export const PLAYER_BLACK = 1;
export const PLAYER_WHITE = 2;
export const EMPTY = 0;

export class OthelloGame {
    constructor() {
        this.board = [];
        this.currentPlayer = PLAYER_BLACK;
        this.gameOver = false;
        this.winner = null;
        this.score = {
            [PLAYER_BLACK]: 0,
            [PLAYER_WHITE]: 0
        };
        this.initBoard();
    }

    initBoard() {
        // Create 8x8 empty board
        this.board = Array(8).fill(null).map(() => Array(8).fill(EMPTY));

        // Initial setup: Center 4 pieces
        // White at (3,3), (4,4)
        // Black at (3,4), (4,3)
        this.board[3][3] = PLAYER_WHITE;
        this.board[4][4] = PLAYER_WHITE;
        this.board[3][4] = PLAYER_BLACK;
        this.board[4][3] = PLAYER_BLACK;

        this.calculateScore();
    }

    // Directions: [dRow, dCol]
    // N, NE, E, SE, S, SW, W, NW
    static DIRECTIONS = [
        [-1, 0], [-1, 1], [0, 1], [1, 1],
        [1, 0], [1, -1], [0, -1], [-1, -1]
    ];

    isValidMove(row, col, player) {
        if (this.board[row][col] !== EMPTY) return false;

        for (let [dRow, dCol] of OthelloGame.DIRECTIONS) {
            if (this.canCaptureInDirection(row, col, dRow, dCol, player)) {
                return true;
            }
        }
        return false;
    }

    canCaptureInDirection(row, col, dRow, dCol, player) {
        let r = row + dRow;
        let c = col + dCol;
        let hasOpponentBetween = false;
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const cell = this.board[r][c];
            if (cell === opponent) {
                hasOpponentBetween = true;
            } else if (cell === player) {
                return hasOpponentBetween;
            } else {
                return false; // Found empty
            }
            r += dRow;
            c += dCol;
        }
        return false; // Hit edge
    }

    getValidMoves(player) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.isValidMove(r, c, player)) {
                    moves.push({ row: r, col: c });
                }
            }
        }
        return moves;
    }

    makeMove(row, col) {
        if (this.gameOver) return false;
        if (!this.isValidMove(row, col, this.currentPlayer)) return false;

        // Place piece
        this.board[row][col] = this.currentPlayer;

        // Flip pieces
        const flippedPositions = []; // Track flips for animation if needed
        for (let [dRow, dCol] of OthelloGame.DIRECTIONS) {
            if (this.canCaptureInDirection(row, col, dRow, dCol, this.currentPlayer)) {
                this.flipInDirection(row, col, dRow, dCol, this.currentPlayer, flippedPositions);
            }
        }

        this.calculateScore();
        this.switchTurn();
        return {
            success: true,
            flipped: flippedPositions
        };
    }

    flipInDirection(row, col, dRow, dCol, player, flippedArr) {
        let r = row + dRow;
        let c = col + dCol;
        const opponent = player === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === opponent) {
                this.board[r][c] = player;
                flippedArr.push({ row: r, col: c });
            } else if (this.board[r][c] === player) {
                break;
            }
            r += dRow;
            c += dCol;
        }
    }

    switchTurn() {
        const nextPlayer = this.currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;

        // Check if next player has moves
        const nextMoves = this.getValidMoves(nextPlayer);
        if (nextMoves.length > 0) {
            this.currentPlayer = nextPlayer;
        } else {
            // Pass turn logic
            // Check if CURRENT player has moves (if both pass, game over)
            const currentMoves = this.getValidMoves(this.currentPlayer);
            if (currentMoves.length === 0) {
                this.endGame();
            } else {
                // Keep turn, maybe notify UI about "Pass"
                console.log(`Player ${nextPlayer} has no moves. Passing back to ${this.currentPlayer}.`);
            }
        }
    }

    calculateScore() {
        let black = 0;
        let white = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] === PLAYER_BLACK) black++;
                else if (this.board[r][c] === PLAYER_WHITE) white++;
            }
        }
        this.score[PLAYER_BLACK] = black;
        this.score[PLAYER_WHITE] = white;
    }

    endGame() {
        this.gameOver = true;
        if (this.score[PLAYER_BLACK] > this.score[PLAYER_WHITE]) this.winner = PLAYER_BLACK;
        else if (this.score[PLAYER_WHITE] > this.score[PLAYER_BLACK]) this.winner = PLAYER_WHITE;
        else this.winner = 0; // Draw
    }

    resetGame() {
        this.gameOver = false;
        this.winner = null;
        this.currentPlayer = PLAYER_BLACK;
        this.initBoard();
    }
}
