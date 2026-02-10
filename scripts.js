// Elementos do DOM
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const highScoreEl = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const newRecordEl = document.getElementById('newRecord');

// Variáveis do jogo
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];

let food = { x: 15, y: 15 };
let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let level = 1;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100;
let gameLoopId = null;

// Atualizar display de pontuação
scoreEl.textContent = score;
levelEl.textContent = level;
highScoreEl.textContent = highScore;

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
resetBtn.addEventListener('click', resetGame);

// Controles de teclado
document.addEventListener('keydown', handleKeyPress);

// Controles de toque
document.getElementById('upBtn')?.addEventListener('click', () => changeDirection(0, -1));
document.getElementById('downBtn')?.addEventListener('click', () => changeDirection(0, 1));
document.getElementById('leftBtn')?.addEventListener('click', () => changeDirection(-1, 0));
document.getElementById('rightBtn')?.addEventListener('click', () => changeDirection(1, 0));

// Função para cuidar das setas do teclado
function handleKeyPress(e) {
    if (!gameRunning || gamePaused) return;

    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) changeDirection(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) changeDirection(0, 1);
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) changeDirection(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) changeDirection(1, 0);
            e.preventDefault();
            break;
    }
}

// Mudar direção
function changeDirection(newDx, newDy) {
    nextDx = newDx;
    nextDy = newDy;
}

// Iniciar jogo
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        dx = 1;
        dy = 0;
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        gameLoopId = setInterval(gameLoop, gameSpeed);
    }
}

// Pausar jogo
function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        pauseBtn.textContent = gamePaused ? '▶ Retomar' : '⏸ Pausar';
    }
}

// Resetar jogo
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(gameLoopId);
    
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = 0;
    score = 0;
    level = 1;
    gameSpeed = 100;
    
    scoreEl.textContent = score;
    levelEl.textContent = level;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pausar';
    
    gameOverModal.classList.remove('show');
    drawGame();
}

// Game Loop
function gameLoop() {
    if (gamePaused) return;
    
    // Aplicar próxima direção
    dx = nextDx;
    dy = nextDy;
    
    // Se não há movimento, não move
    if (dx === 0 && dy === 0) return;
    
    // Calcular nova cabeça
    let head = {
        x: snake[0].x + dx,
        y: snake[0].y + dy
    };
    
    // Verificar colisão com paredes
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        endGame();
        return;
    }
    
    // Verificar colisão consigo mesmo
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    // Adicionar nova cabeça
    snake.unshift(head);
    
    // Verificar se comeu a comida
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.textContent = score;
        
        // Aumentar nível a cada 5 pontos
        const newLevel = Math.floor(score / 50) + 1;
        if (newLevel > level) {
            level = newLevel;
            levelEl.textContent = level;
            
            // Aumentar velocidade
            gameSpeed = Math.max(50, 100 - (level - 1) * 10);
            clearInterval(gameLoopId);
            gameLoopId = setInterval(gameLoop, gameSpeed);
        }
        
        // Gerar nova comida
        generateFood();
    } else {
        // Remove a cauda se não comeu
        snake.pop();
    }
    
    drawGame();
}

// Gerar comida em posição aleatória
function generateFood() {
    let newFood;
    let validPosition = false;
    
    while (!validPosition) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        // Verificar se a comida não está na cobra
        validPosition = !snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    food = newFood;
}

// Desenhar jogo
function drawGame() {
    // Fundo preto
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grade (opcional)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }
    
    // Desenhar cobra
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Cabeça - cor mais clara
            ctx.fillStyle = '#4ade80';
            ctx.shadowColor = '#4ade80';
            ctx.shadowBlur = 10;
        } else {
            // Corpo - gradualmente mais escuro
            const brightness = Math.max(50, 200 - index * 10);
            ctx.fillStyle = `rgb(16, 185, 129)`;
            ctx.shadowColor = 'transparent';
        }
        
        ctx.fillRect(
            segment.x * gridSize + 1,
            segment.y * gridSize + 1,
            gridSize - 2,
            gridSize - 2
        );
        
        // Olhos na cabeça
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = 3;
            const eyeOffset = 5;
            
            if (dx !== 0 || dy !== 0) {
                // Posicionar olhos baseado na direção
                if (dx > 0) { // Direita
                    ctx.fillRect(
                        segment.x * gridSize + eyeOffset + 5 + gridSize - 10,
                        segment.y * gridSize + eyeOffset,
                        eyeSize, eyeSize
                    );
                    ctx.fillRect(
                        segment.x * gridSize + eyeOffset + 5 + gridSize - 10,
                        segment.y * gridSize + gridSize - eyeOffset - eyeSize,
                        eyeSize, eyeSize
                    );
                }
            }
        }
    });
    
    ctx.shadowColor = 'transparent';
    
    // Desenhar comida
    const foodX = food.x * gridSize + gridSize / 2;
    const foodY = food.y * gridSize + gridSize / 2;
    
    // Maçã com brilho
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(foodX, foodY, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Folha da maçã
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(foodX - 2, foodY - gridSize / 2 + 2, 4, 4);
    
    ctx.shadowColor = 'transparent';
}

// Fim do jogo
function endGame() {
    gameRunning = false;
    clearInterval(gameLoopId);
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = '⏸ Pausar';
    
    finalScoreEl.textContent = score;
    
    // Verificar novo recorde
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
        newRecordEl.style.display = 'block';
    } else {
        newRecordEl.style.display = 'none';
    }
    
    gameOverModal.classList.add('show');
}

// Desenhar jogo inicial
drawGame();
