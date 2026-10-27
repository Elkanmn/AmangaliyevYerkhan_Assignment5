// TASK 1: Higher or Lower (variables, random numbers and conditions)
const MIN_SCORE = 1;
const MAX_SCORE = 20;
const START_LIVES = 3;
const WIN_STREAK = 5;
const HISTORY_LIMIT = 5;

const numberEl = document.querySelector('#game-number');
const livesEl = document.querySelector('#game-lives');
const streakEl = document.querySelector('#game-streak');
const bestEl = document.querySelector('#game-best');
const messageEl = document.querySelector('#game-message');
const historyEl = document.querySelector('#game-history');
const guessButtons = document.querySelectorAll('[data-guess]');

let currentScore;
let lives;
let streak;
let bestStreak = 0;
let gameOver;
let rounds;

// +1 makes the minimum AND the maximum possible.
function randomScore() {
  return Math.floor(Math.random() * (MAX_SCORE - MIN_SCORE + 1)) + MIN_SCORE;
}

function showGame() {
  numberEl.textContent = currentScore;
  livesEl.textContent = lives;
  streakEl.textContent = streak;
  bestEl.textContent = bestStreak;

  for (const button of guessButtons) {
    button.disabled = gameOver;
  }

  historyEl.replaceChildren();
  if (rounds.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'muted-item';
    empty.textContent = 'Your rounds will appear here.';
    historyEl.append(empty);
  }
  for (const round of rounds) {
    const item = document.createElement('li');
    item.className = round.correct ? 'round-correct' : 'round-wrong';
    item.textContent = `${round.before} → ${round.after} · ${round.correct ? 'Correct' : 'Wrong'}`;
    historyEl.append(item);
  }
}

function makeGuess(guess) {
  // An invalid move must not modify lives, streak, numbers, or history.
  if (gameOver || (guess !== 'higher' && guess !== 'lower')) {
    messageEl.textContent = gameOver ? 'Game finished. Press Restart to play again.' : 'Invalid move.';
    return;
  }

  const nextScore = randomScore();
  // Equal scores count as correct in both directions.
  const correct = (guess === 'higher' && nextScore >= currentScore) ||
                  (guess === 'lower' && nextScore <= currentScore);
  rounds.unshift({ before: currentScore, after: nextScore, correct: correct });
  if (rounds.length > HISTORY_LIMIT) rounds.pop();
  currentScore = nextScore;

  if (correct) {
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    messageEl.textContent = 'Correct guess! Keep going.';
    messageEl.className = 'game-message is-success';
  } else {
    lives--;
    streak = 0;
    messageEl.textContent = 'Wrong guess. You lost one life.';
    messageEl.className = 'game-message is-error';
  }

  if (streak === WIN_STREAK) {
    gameOver = true;
    messageEl.textContent = 'You won! Five correct guesses in a row!';
    messageEl.className = 'game-message is-success';
  } else if (lives === 0) {
    gameOver = true;
    messageEl.textContent = 'Game over! Try again with Restart.';
    messageEl.className = 'game-message is-error';
  }
  showGame();
}

function restartGame() {
  currentScore = randomScore();
  lives = START_LIVES;
  streak = 0;
  gameOver = false;
  rounds = [];
  messageEl.textContent = 'Choose your guess to start.';
  messageEl.className = 'game-message';
  showGame();
}

for (const button of guessButtons) {
  button.addEventListener('click', () => makeGuess(button.dataset.guess));
}
document.querySelector('#game-restart').addEventListener('click', restartGame);
restartGame();
