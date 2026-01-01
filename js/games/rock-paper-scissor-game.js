const CHOICES = {
  rock: { name: 'Rock', icon: '🪨', beats: 'scissors' },
  paper: { name: 'Paper', icon: '📄', beats: 'rock' },
  scissors: { name: 'Scissors', icon: '✂️', beats: 'paper' }
};

const LEADERBOARD_KEY = 'leaderboard-rps';
const MAX_LEADERBOARD_ENTRIES = 10;

let scores = {
  player: 0,
  computer: 0,
  draws: 0
};

const choiceBtns = document.querySelectorAll('.choice-btn');
const playerChoiceDisplay = document.getElementById('playerChoiceDisplay');
const computerChoiceDisplay = document.getElementById('computerChoiceDisplay');
const resultMessage = document.getElementById('resultMessage');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');
const drawsEl = document.getElementById('draws');
const resetBtn = document.getElementById('resetBtn');

/**
 * Initialize the game
 */
function initGame() {
  loadScores();
  updateScoreDisplay();
  attachEventListeners();
}

/**
 * Attach event listeners to buttons
 */
function attachEventListeners() {
  choiceBtns.forEach(btn => {
    btn.addEventListener('click', handlePlayerChoice);
  });

  resetBtn.addEventListener('click', resetScores);
}

/**
 * Handle player's choice
 * @param {Event} event
 */
function handlePlayerChoice(event) {
  const playerChoice = event.currentTarget.dataset.choice;
  const computerChoice = getComputerChoice();

  disableButtons(true);

  displayChoice(playerChoiceDisplay, playerChoice, true);

  animateComputerChoice(computerChoice, () => {
    const result = determineWinner(playerChoice, computerChoice);
    updateScores(result);
    displayResult(result, playerChoice, computerChoice);

    if (result === 'win') {
      updateLeaderboard();
    }

    setTimeout(() => {
      disableButtons(false);
      resetChoiceDisplays();
    }, 2000);
  });
}

/**
 * Get random computer choice
 * @returns {string}
 */
function getComputerChoice() {
  const choices = Object.keys(CHOICES);
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

/**
 * Display choice in the arena
 * @param {HTMLElement} element
 * @param {string} choice
 * @param {boolean} isActive
 */
function displayChoice(element, choice, isActive = false) {
  const choiceData = CHOICES[choice];
  element.querySelector('.choice-icon').textContent = choiceData.icon;

  if (isActive) {
    element.classList.add('active');
  }
}

/**
 * Animate computer's choice selection
 * @param {string} finalChoice
 * @param {Function} callback
 */
function animateComputerChoice(finalChoice, callback) {
  const choices = Object.keys(CHOICES);
  let currentIndex = 0;
  let iterations = 0;
  const maxIterations = 10;

  const interval = setInterval(() => {
    const choice = choices[currentIndex % choices.length];
    displayChoice(computerChoiceDisplay, choice, true);
    currentIndex++;
    iterations++;

    if (iterations >= maxIterations) {
      clearInterval(interval);
      displayChoice(computerChoiceDisplay, finalChoice, true);
      callback();
    }
  }, 100);
}

/**
 * Reset choice displays
 */
function resetChoiceDisplays() {
  playerChoiceDisplay.querySelector('.choice-icon').textContent = '❓';
  computerChoiceDisplay.querySelector('.choice-icon').textContent = '❓';
  playerChoiceDisplay.classList.remove('active');
  computerChoiceDisplay.classList.remove('active');
}

/**
 * Determine the winner
 * @param {string} playerChoice
 * @param {string} computerChoice
 * @returns {string} 'win', 'lose', or 'draw'
 */
function determineWinner(playerChoice, computerChoice) {
  if (playerChoice === computerChoice) {
    return 'draw';
  }

  if (CHOICES[playerChoice].beats === computerChoice) {
    return 'win';
  }

  return 'lose';
}

/**
 * Update scores based on result
 * @param {string} result
 */
function updateScores(result) {
  switch (result) {
    case 'win':
      scores.player++;
      break;
    case 'lose':
      scores.computer++;
      break;
    case 'draw':
      scores.draws++;
      break;
  }

  updateScoreDisplay();
  saveScores();
}

/**
 * Display result message
 * @param {string} result
 * @param {string} playerChoice
 * @param {string} computerChoice
 */
function displayResult(result, playerChoice, computerChoice) {
  resultMessage.className = 'result-message ' + result;

  let message;
  switch (result) {
    case 'win':
      message = `You Win! ${CHOICES[playerChoice].name} beats ${CHOICES[computerChoice].name}!`;
      break;
    case 'lose':
      message = `You Lose! ${CHOICES[computerChoice].name} beats ${CHOICES[playerChoice].name}!`;
      break;
    case 'draw':
      message = `It's a Draw! Both chose ${CHOICES[playerChoice].name}!`;
      break;
    default:
      message = 'Unknown result!';
  }

  resultMessage.textContent = message;
}

/**
 * Update score display
 */
function updateScoreDisplay() {
  playerScoreEl.textContent = scores.player;
  computerScoreEl.textContent = scores.computer;
  drawsEl.textContent = scores.draws;
}

/**
 * Disable/enable choice buttons
 * @param {boolean} disabled
 */
function disableButtons(disabled) {
  choiceBtns.forEach(btn => {
    btn.disabled = disabled;
  });
}

/**
 * Reset all scores
 */
function resetScores() {
  if (confirm('Are you sure you want to reset all scores?')) {
    scores = {
      player: 0,
      computer: 0,
      draws: 0
    };
    updateScoreDisplay();
    saveScores();
    resetChoiceDisplays();
    resultMessage.className = 'result-message';
    resultMessage.textContent = 'Scores reset! Make your choice!';
  }
}

/**
 * Save scores to localStorage
 */
function saveScores() {
  try {
    localStorage.setItem('rps-scores', JSON.stringify(scores));
  } catch (e) {
    console.error('Failed to save scores:', e);
  }
}

/**
 * Load scores from localStorage
 */
function loadScores() {
  try {
    const savedScores = localStorage.getItem('rps-scores');
    if (savedScores) {
      scores = JSON.parse(savedScores);
    }
  } catch (e) {
    console.error('Failed to load scores:', e);
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
      if (scores.player > leaderboard[existingIndex].score) {
        leaderboard[existingIndex].score = scores.player;
      }
    } else {
      leaderboard.push({
        name: heroName,
        score: scores.player,
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
