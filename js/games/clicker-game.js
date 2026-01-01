const GAME_DURATION = 10;
const LEADERBOARD_KEY = 'leaderboard-clicker';
const BEST_SCORE_KEY = 'clicker-best-score';
const MAX_LEADERBOARD_ENTRIES = 10;

let gameState = {
  isPlaying: false,
  score: 0,
  timeLeft: GAME_DURATION,
  bestScore: 0,
  startTime: null
};

let timerInterval = null;

const clickZone = document.getElementById('clickZone');
const clickText = clickZone.querySelector('.click-text');
const currentScoreEl = document.getElementById('currentScore');
const timeLeftEl = document.getElementById('timeLeft');
const bestScoreEl = document.getElementById('bestScore');
const gameMessage = document.getElementById('gameMessage');
const progressBar = document.getElementById('progressBar');
const gameOverContainer = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const playAgainBtn = document.getElementById('playAgainBtn');
const resetBtn = document.getElementById('resetBtn');

/**
 * Initialize the game
 */
function initGame() {
  loadBestScore();
  updateDisplay();
  attachEventListeners();
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  clickZone.addEventListener('click', handleClick);
  playAgainBtn.addEventListener('click', resetGame);
  resetBtn.addEventListener('click', resetBestScore);
}

/**
 * Handle click on the click zone
 */
function handleClick() {
  if (!gameState.isPlaying) {
    startGame();
  } else {
    incrementScore();
  }

  clickZone.classList.add('active');
  setTimeout(() => clickZone.classList.remove('active'), 150);
}

/**
 * Start a new game
 */
function startGame() {
  gameState.isPlaying = true;
  gameState.score = 0;
  gameState.timeLeft = GAME_DURATION;
  gameState.startTime = Date.now();

  clickText.textContent = 'CLICK!';
  clickZone.classList.add('game-active');
  gameMessage.textContent = 'Click as fast as you can!';
  gameOverContainer.classList.add('hidden');

  updateDisplay();
  startTimer();
}

/**
 * Start the game timer
 */
function startTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
  }

  timerInterval = setInterval(() => {
    gameState.timeLeft -= 0.1;

    if (gameState.timeLeft <= 0) {
      endGame();
    } else {
      updateDisplay();
    }
  }, 100);
}

/**
 * Increment the score
 */
function incrementScore() {
  gameState.score++;
  updateDisplay();
}

/**
 * End the game
 */
function endGame() {
  clearInterval(timerInterval);
  gameState.isPlaying = false;
  gameState.timeLeft = 0;

  clickZone.classList.remove('game-active');
  clickText.textContent = 'DONE';
  gameMessage.textContent = 'Game Over!';

  if (gameState.score > gameState.bestScore) {
    gameState.bestScore = gameState.score;
    saveBestScore();
    gameMessage.textContent = 'New Best Score!';
  }

  updateLeaderboard();

  finalScoreEl.textContent = gameState.score;
  gameOverContainer.classList.remove('hidden');

  updateDisplay();
}

/**
 * Reset the game for a new round
 */
function resetGame() {
  gameState.score = 0;
  gameState.timeLeft = GAME_DURATION;
  gameState.isPlaying = false;

  clickText.textContent = 'START';
  clickZone.classList.remove('game-active');
  gameMessage.textContent = 'Click the button to start!';
  gameOverContainer.classList.add('hidden');

  updateDisplay();
}

/**
 * Update all display elements
 */
function updateDisplay() {
  currentScoreEl.textContent = gameState.score;
  timeLeftEl.textContent = gameState.timeLeft.toFixed(1);
  bestScoreEl.textContent = gameState.bestScore;

  const progress = (gameState.timeLeft / GAME_DURATION) * 100;
  progressBar.style.width = `${Math.max(0, progress)}%`;

  if (gameState.timeLeft < 3) {
    progressBar.style.background = 'linear-gradient(90deg, #f44336 0%, #ff9800 100%)';
  } else if (gameState.timeLeft < 5) {
    progressBar.style.background = 'linear-gradient(90deg, #ff9800 0%, #FFD700 100%)';
  } else {
    progressBar.style.background = 'linear-gradient(90deg, #4CAF50 0%, #FFD700 100%)';
  }
}

/**
 * Load best score from localStorage
 */
function loadBestScore() {
  try {
    const savedScore = localStorage.getItem(BEST_SCORE_KEY);
    if (savedScore) {
      gameState.bestScore = parseInt(savedScore, 10);
    }
  } catch (e) {
    console.error('Failed to load best score:', e);
  }
}

/**
 * Save best score to localStorage
 */
function saveBestScore() {
  try {
    localStorage.setItem(BEST_SCORE_KEY, gameState.bestScore.toString());
  } catch (e) {
    console.error('Failed to save best score:', e);
  }
}

/**
 * Reset best score
 */
function resetBestScore() {
  if (confirm('Are you sure you want to reset your best score?')) {
    gameState.bestScore = 0;
    saveBestScore();
    updateDisplay();
    gameMessage.textContent = 'Best score reset!';
    setTimeout(() => {
      if (!gameState.isPlaying) {
        gameMessage.textContent = 'Click the button to start!';
      }
    }, 2000);
  }
}

/**
 * Update leaderboard with current score
 */
function updateLeaderboard() {
  try {
    const heroName = localStorage.getItem('heroName') || 'Anonymous';
    let leaderboard = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');

    const existingIndex = leaderboard.findIndex(entry => entry.name === heroName);
    
    if (existingIndex !== -1) {
      if (gameState.score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = gameState.score;
      }
    } else {
      leaderboard.push({
        name: heroName,
        score: gameState.score,
        date: new Date().toISOString()
      });
    }

    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard = leaderboard.slice(0, MAX_LEADERBOARD_ENTRIES);

    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(leaderboard));
  } catch (e) {
    console.error('Failed to update leaderboard:', e);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}
