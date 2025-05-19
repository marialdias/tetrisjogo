const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

const colors = [
    null,
    'rgb(255, 0, 0)',       // Vermelho
    'rgb(0, 255, 0)',       // Verde
    'rgb(0, 0, 255)',       // Azul
    'rgb(255, 255, 0)',     // Amarelo
    'rgb(255, 165, 0)',     // Laranja
    'rgb(128, 0, 128)',     // Roxo
    'rgb(0, 255, 255)',     // Ciano
    'rgb(128, 128, 128)'    // Cinza
];
const pieces = [
    [[1, 1, 1, 1]],                        // I
    [[1, 1], [1, 1]],                      // O
    [[0, 1, 0], [1, 1, 1]],                // T
    [[0, 1, 1], [1, 1, 0]],                // S
    [[1, 1, 0], [0, 1, 1]],                // Z
    [[1, 0, 0], [1, 1, 1]],                // L
    [[0, 0, 1], [1, 1, 1]],                // J
    [[1, 0, 1], [1, 1, 1]],                // nova peça 1
    [[1, 1, 1], [0, 1, 0], [0, 0, 1]]      // nova peça 2
];

let score = 0;
let level = 1;
let dropInterval = 1000;
let lastTime = 0;
let dropCounter = 0;

let current = {
    matrix: randomPiece(),
    pos: { x: 3, y: 0 }
};

function randomPiece() {
    const piece = pieces[Math.floor(Math.random() * pieces.length)];
    return piece;
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, COLS, ROWS);

    drawMatrix(board, { x: 0, y: 0 });
    drawMatrix(current.matrix, current.pos);
}

function merge(board, piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                board[y + piece.pos.y][x + piece.pos.x] = value;
            }
        });
    });
}

function rotate(matrix) {
    return matrix[0].map((_, i) => matrix.map(row => row[i])).reverse();
}

function collide(board, piece) {
    const [m, o] = [piece.matrix, piece.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    current.pos.y++;
    if (collide(board, current)) {
        current.pos.y--;
        merge(board, current);
        resetPiece();
        clearLines();
    }
    dropCounter = 0;
}

function clearLines() {
    let lines = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x] === 0) {
                continue outer;
            }
        }
        const row = board.splice(y, 1)[0].fill(0);
        board.unshift(row);
        lines++;
    }
    if (lines > 0) {
        score += lines * 10;
        scoreElement.innerText = score;

        if (score >= level * 50) {
            level++;
            dropInterval = Math.max(100, dropInterval - 100);
        }
    }
}

function resetPiece() {
    current.matrix = randomPiece();
    current.pos.y = 0;
    current.pos.x = Math.floor((COLS - current.matrix[0].length) / 2);
    if (collide(board, current)) {
        board.forEach(row => row.fill(0));
        score = 0;
        scoreElement.innerText = score;
        level = 1;
        dropInterval = 1000;
        alert("Fim de jogo! Tente novamente.");
    }
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') {
        current.pos.x--;
        if (collide(board, current)) current.pos.x++;
    } else if (e.key === 'ArrowRight') {
        current.pos.x++;
        if (collide(board, current)) current.pos.x--;
    } else if (e.key === 'ArrowDown') {
        playerDrop();
    } else if (e.key === 'ArrowUp') {
        const rotated = rotate(current.matrix);
        const old = current.matrix;
        current.matrix = rotated;
        if (collide(board, current)) {
            current.matrix = old;
        }
    }
});

update();