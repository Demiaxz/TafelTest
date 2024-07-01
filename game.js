// game.js

var username;
var selectedTables = [];
var numberOfQuestions;
var gameMode;
var timeLimit;
var score = 0;
var currentQuestionIndex = 0;
var questions = [];
var startTime;
var timerInterval;
var answers = [];

function nextScreen(currentScreenId, nextScreenId) {
  document.getElementById(currentScreenId).classList.remove('active');
  document.getElementById(currentScreenId).classList.add('hidden');
  document.getElementById(nextScreenId).classList.remove('hidden');
  document.getElementById(nextScreenId).classList.add('active');
}


// Toggle time limit input field visibility
function toggleTimeLimit() {
  var gameMode = document.getElementById('gameMode').value;
  var timeLimitLabel = document.getElementById('timeLimitLabel');
  if (gameMode === 'timed') {
    timeLimitLabel.classList.remove('hidden');
  } else {
    timeLimitLabel.classList.add('hidden');
  }
}

// Start het spel na het invoeren van de naam
function startGame() {
  username = document.getElementById('usernameInput').value.trim();
  if (!username) {
    alert('Please enter your name.');
    return;
  }

  var checkboxes = document.querySelectorAll('#selectTablesScreen input[type="checkbox"]:checked');
  if (checkboxes.length === 0) {
    alert('Please select at least one table to practice.');
    return;
  }

  selectedTables = Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));

  numberOfQuestions = parseInt(document.getElementById('numberOfQuestions').value);
  gameMode = document.getElementById('gameMode').value;

  if (gameMode === 'timed') {
    timeLimit = parseInt(document.getElementById('timeLimit').value) * 60; // in seconds
  }

  // Verberg alle schermen behalve het spelscherm en laad de eerste vraag
  nextScreen('settingsScreen', 'gameScreen');

  generateQuestions();
  loadQuestion();
  document.getElementById('answerInput').focus();

  if (gameMode === 'timed') {
    startTime = Date.now();
    startTimer();
  }
}

// Genereer vragen op basis van geselecteerde tafels
function generateQuestions() {
  questions = [];
  for (var i = 0; i < numberOfQuestions; i++) {
    var table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    var question = generateMultiplicationQuestion(table);
    questions.push(question);
  }
}

// Genereer vraag binnen specifieke tafel
function generateMultiplicationQuestion(table) {
  var num1 = table;
  var num2 = Math.floor(Math.random() * 10) + 1;
  return {
    num1: num1,
    num2: num2,
    answer: num1 * num2
  };
}

// Laad huidige vraag
function loadQuestion() {
  var currentQuestion = questions[currentQuestionIndex];
  document.getElementById('question').textContent = `Question ${currentQuestionIndex + 1} of ${numberOfQuestions}: What is ${currentQuestion.num1} × ${currentQuestion.num2}?`;
  document.getElementById('progress').textContent = `Progress: ${currentQuestionIndex + 1}/${numberOfQuestions}`;
  document.getElementById('feedback').textContent = '';
  document.getElementById('answerInput').value = '';
}

// Controleer invoer van gebruiker
function checkInput(event) {
  var userAnswer = document.getElementById('answerInput').value.trim();
  if (event.key === 'Escape') {
    endGame();
    return;
  }
  if (userAnswer.length === String(questions[currentQuestionIndex].answer).length) {
    var correctAnswer = questions[currentQuestionIndex].answer;
    var completionTime = Date.now() - startTime;
    answers.push({
      question: `${questions[currentQuestionIndex].num1} × ${questions[currentQuestionIndex].num2}`,
      correctAnswer: correctAnswer,
      userAnswer: parseInt(userAnswer),
      completionTime: completionTime
    });

    if (parseInt(userAnswer) === correctAnswer) {
      score++;
      updateScore();
      document.getElementById('feedback').textContent = 'Correct!';
    } else {
      document.getElementById('feedback').textContent = 'Incorrect. Please try again.';
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < numberOfQuestions) {
      loadQuestion();
    } else {
      endGame();
    }
  }
}


// Update score op scherm
function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

// Start timer voor timed mode
function startTimer() {
  timerInterval = setInterval(function () {
    var elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    var remainingSeconds = timeLimit - elapsedSeconds;
    if (remainingSeconds <= 0) {
      endGame();
    }
    var minutes = Math.floor(remainingSeconds / 60);
    var seconds = remainingSeconds % 60;
    document.getElementById('timer').textContent = `Time Left: ${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, 1000);
}

// Beëindig spel en toon rapportage
function endGame() {
  clearInterval(timerInterval);

  // Display summary
  var summary = `<h2>Summary</h2>`;
  summary += `<p>Student: ${username}</p>`;
  summary += `<p>Tables Practiced: ${selectedTables.join(', ')}</p>`;
  summary += `<p>${username} answered ${score} out of ${numberOfQuestions} questions correctly.</p>`;
  document.getElementById('summary').innerHTML = summary;

  // Display detailed report
  var detailedReport = `<h2>Detailed Report</h2>`;
  detailedReport += `<table>
    <tr><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th>Time (s)</th></tr>`;
  answers.forEach(answer => {
    detailedReport += `<tr>
      <td>${answer.question}</td>
      <td>${answer.correctAnswer}</td>
      <td>${answer.userAnswer}</td>
      <td>${(answer.completionTime / 1000).toFixed(2)}</td>
    </tr>`;
  });
  detailedReport += `</table>`;
  document.getElementById('detailedReport').innerHTML = detailedReport;

  // Toon het rapportage scherm
  nextScreen('gameScreen', 'reportScreen');
}



// Herstart spel
function restartGame() {
  // Reset variabelen en schermen
  username = '';
  selectedTables = [];
  numberOfQuestions = 0;
  gameMode = '';
  timeLimit = 0;
  score = 0;
  currentQuestionIndex = 0;
  questions = [];
  answers = [];
  startTime = 0;
  clearInterval(timerInterval);

  // Reset input velden en schermen
  document.getElementById('numberOfQuestions').value = '10';
  document.getElementById('gameMode').selectedIndex = 0;
  toggleTimeLimit(); // Ensure the time limit input field is hidden initially

  // Verberg rapportage en toon tafel selectiescherm
  nextScreen('reportScreen', 'selectTablesScreen');
}
