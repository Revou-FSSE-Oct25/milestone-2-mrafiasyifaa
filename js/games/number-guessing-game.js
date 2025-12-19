let targetNumber;
let attemptsLeft;
let gameActive;
let previousGuesses;

const guessInput = document.getElementById("guessInput");
const submitBtn = document.getElementById("submitBtn");
const feedback = document.getElementById("feedback");
const attemptsLeftSpan = document.getElementById("attemptsLeft");
const gameContainer = document.getElementById("gameContainer");
const gameOverContainer = document.getElementById("gameOverContainer");
const gameOverMessage = document.getElementById("gameOverMessage");
const resetBtn = document.getElementById("resetBtn");
const previousGuessesList = document.getElementById("guessList");
const previousGuessesContainer = document.getElementById("previousGuesses");

/**
 * Initialize a new game
 * Sets up all game variables and resets the UI
 */
function initGame() {
  targetNumber = Math.floor(Math.random() * 100) + 1;
  attemptsLeft = 10;
  gameActive = true;
  previousGuesses = [];

  guessInput.value = "";
  guessInput.disabled = false;
  submitBtn.disabled = false;
  attemptsLeftSpan.textContent = attemptsLeft;

  gameContainer.classList.remove("hidden");
  gameOverContainer.classList.remove("show");
  feedback.classList.remove("show");
  previousGuessesContainer.classList.remove("show");

  previousGuessesList.innerHTML = "";

  guessInput.focus();

  console.log("New game started! Target number:", targetNumber);
}

/**
 * Validate user input
 * @param {string} input
 * @returns {object}
 */
function validateInput(input) {
  if (input.trim() === "") {
    return { isValid: false, message: "Please enter a number!" };
  }

  const number = parseInt(input);

  if (isNaN(number) || number < 0) {
    return { isValid: false, message: "Please enter a valid positive number!" };
  }

  if (number < 1 || number > 100) {
    return { isValid: false, message: "Please enter a number between 1 and 100!" };
  }

  if (!Number.isInteger(number)) {
    return { isValid: false, message: "Please enter a whole number!" };
  }

  if (previousGuesses.includes(number)) {
    return { isValid: false, message: "You already guessed that number!" };
  }

  return { isValid: true, number: number };
}

/**
 * Display feedback message to the user
 * @param {string} message
 * @param {string} type
 */
function showFeedback(message, type = "info") {
  feedback.textContent = message;
  feedback.classList.remove("success", "error", "info", "warning");
  feedback.classList.add("show", type);
}

/**
 * Add a guess to the previous guesses display
 * @param {number} guess
 */
function addToPreviousGuesses(guess) {
  previousGuesses.push(guess);

  const guessSpan = document.createElement("span");
  guessSpan.textContent = guess;
  guessSpan.className = "guess-badge";

  previousGuessesList.appendChild(guessSpan);
  previousGuessesContainer.classList.add("show");
}

/**
 * Process the user's guess
 * @param {number} guess
 */
function processGuess(guess) {
  addToPreviousGuesses(guess);

  attemptsLeft--;
  attemptsLeftSpan.textContent = attemptsLeft;

  if (guess === targetNumber) {
    showFeedback("Congratulations! You guessed it!", "success");
    endGame(true);
    return;
  }

  if (attemptsLeft === 0) {
    showFeedback(`Game Over! The number was ${targetNumber}.`, "error");
    endGame(false);
    return;
  }

  if (guess > targetNumber) {
    showFeedback("Too high! Try a lower number.", "warning");
  } else {
    showFeedback("Too low! Try a higher number.", "info");
  }

  guessInput.value = "";
  guessInput.focus();
}

/**
 * End the current game
 * @param {boolean} won
 */
function endGame(won) {
  gameActive = false;
  guessInput.disabled = true;
  submitBtn.disabled = true;

  gameContainer.classList.add("hidden");
  gameOverContainer.classList.add("show");

  if (won) {
    const attempts = 10 - attemptsLeft;
    gameOverMessage.innerHTML = `
            <h2 style="color: var(--color-primary); margin-bottom: 10px; font-family: var(--font-pixel); font-size: 1.3rem;">You Won!</h2>
            <p>You guessed the number <strong>${targetNumber}</strong> in <strong>${attempts}</strong> attempt${attempts === 1 ? "" : "s"
      }!</p>
        `;
  } else {
    gameOverMessage.innerHTML = `
            <h2 style="color: #F44336; margin-bottom: 10px; font-family: var(--font-pixel); font-size: 1.3rem;">Game Over</h2>
            <p>The number was <strong>${targetNumber}</strong>. Don't give up!</p>
        `;
  }
}

/**
 * Handle the submit button click or Enter key press
 */
function handleSubmit() {
  if (!gameActive) return;

  const userInput = guessInput.value;
  const validation = validateInput(userInput);

  if (!validation.isValid) {
    showFeedback(validation.message, "error");
    guessInput.focus();
    return;
  }

  processGuess(validation.number);
}


submitBtn.addEventListener("click", handleSubmit);

guessInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    handleSubmit();
  }
});

resetBtn.addEventListener("click", initGame);

initGame();
