var username;
var selectedTables = [];
var numberOfQuestions;
var gameMode;
var timeLimit;
var exerciseType;
var difficultyLevel;
var score = 0;
var currentQuestionIndex = 0;
var questions = [];
var startTime;
var timerInterval;
var answers = [];
var badges = [];
var questionStartTime; // Variabele om de starttijd van elke vraag op te slaan

// Functie om naar het volgende scherm te gaan
function nextScreen(currentScreenId, nextScreenId) {
  document.getElementById(currentScreenId).classList.remove('active');
  document.getElementById(currentScreenId).classList.add('hidden');
  document.getElementById(nextScreenId).classList.remove('hidden');
  document.getElementById(nextScreenId).classList.add('active');

  // Voeg een eenvoudige fade-in animatie toe
  document.getElementById(nextScreenId).style.opacity = 0;
  setTimeout(function() {
    document.getElementById(nextScreenId).style.opacity = 1;
  }, 100);
}

// Toggle time limit input field visibility
function toggleTimeLimit() {
  var gameMode = document.getElementById('gameMode').value;
  var timeLimitLabel = document.getElementById('timeLimitLabel');
  if (gameMode === 'timed' || gameMode === 'marathon') {
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
  exerciseType = document.getElementById('exerciseType').value;
  difficultyLevel = document.getElementById('difficultyLevel').value;

  if (gameMode === 'timed' || gameMode === 'marathon') {
    timeLimit = parseInt(document.getElementById('timeLimit').value) * 60; // in seconds
  }

  // Verberg alle schermen behalve het spelscherm en laad de eerste vraag
  nextScreen('settingsScreen', 'gameScreen');

  generateQuestions();
  loadQuestion();
  document.getElementById('answerInput').focus();

  if (gameMode === 'timed' || gameMode === 'marathon') {
    startTime = Date.now();
    startTimer();
  }
}

// Genereer vragen op basis van geselecteerde tafels en moeilijkheidsgraad
function generateQuestions() {
  questions = [];
  for (var i = 0; i < numberOfQuestions; i++) {
    var table = selectedTables[Math.floor(Math.random() * selectedTables.length)];
    var question;
    switch (exerciseType) {
      case 'multiplication':
        question = generateMultiplicationQuestion(table);
        break;
      case 'addition':
        question = generateAdditionQuestion();
        break;
      case 'subtraction':
        question = generateSubtractionQuestion();
        break;
      case 'division':
        question = generateDivisionQuestion();
        break;
    }
    questions.push(question);
  }
}

// Genereer vermenigvuldigingsvragen voor een specifieke tafel
function generateMultiplicationQuestion(table) {
  var num1 = table;
  var num2 = Math.floor(Math.random() * 10) + 1;
  return {
    num1: num1,
    num2: num2,
    answer: num1 * num2
  };
}

// Genereer optelvragen
function generateAdditionQuestion() {
  var num1 = getRandomNumber();
  var num2 = getRandomNumber();
  return {
    num1: num1,
    num2: num2,
    answer: num1 + num2
  };
}

// Genereer aftrekvragen
function generateSubtractionQuestion() {
  var num1 = getRandomNumber();
  var num2 = getRandomNumber();
  return {
    num1: num1,
    num2: num2,
    answer: num1 - num2
  };
}

// Genereer deelvragen
function generateDivisionQuestion() {
  var num1 = getRandomNumber();
  var num2 = getRandomNumber();
  return {
    num1: num1 * num2,
    num2: num2,
    answer: num1
  };
}

// Bepaal de moeilijkheidsgraad en geef een willekeurig nummer
function getRandomNumber() {
  switch (difficultyLevel) {
    case 'easy':
      return Math.floor(Math.random() * 10) + 1;
    case 'medium':
      return Math.floor(Math.random() * 50) + 1;
    case 'hard':
      return Math.floor(Math.random() * 100) + 1;
  }
}

// Laad huidige vraag
function loadQuestion() {
  var currentQuestion = questions[currentQuestionIndex];
  document.getElementById('question').textContent = `Question ${currentQuestionIndex + 1} of ${numberOfQuestions}: What is ${currentQuestion.num1} ${getOperator()} ${currentQuestion.num2}?`;
  document.getElementById('progress').textContent = `Progress: ${currentQuestionIndex + 1}/${numberOfQuestions}`;
  document.getElementById('feedback').textContent = '';
  document.getElementById('answerInput').value = '';
  questionStartTime = Date.now(); // Stel de starttijd van de huidige vraag in
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
    var completionTime = Date.now() - questionStartTime; // Bereken de tijd die nodig was om de vraag te beantwoorden
    answers.push({
      question: `${questions[currentQuestionIndex].num1} ${getOperator()} ${questions[currentQuestionIndex].num2}`,
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

// Haal de operator op basis van de oefening
function getOperator() {
  switch (exerciseType) {
    case 'multiplication':
      return '×';
    case 'addition':
      return '+';
    case 'subtraction':
      return '-';
    case 'division':
      return '÷';
  }
}

// Update score op scherm
function updateScore() {
  document.getElementById('score').textContent = `Score: ${score}`;
}

// Start timer voor timed en marathon modes
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

// Voeg badges toe op basis van prestaties
function awardBadges() {
  badges = [];
  if (score === numberOfQuestions) {
    badges.push('Perfect Score');
  }
  if (gameMode === 'timed' && score > numberOfQuestions / 2) {
    badges.push('Time Master');
  }
  if (difficultyLevel === 'hard' && score > numberOfQuestions / 2) {
    badges.push('Hard Worker');
  }
}

// Sla het resultaat op in de lokale opslag
function saveResult() {
  var result = {
    username: username,
    selectedTables: selectedTables,
    numberOfQuestions: numberOfQuestions,
    gameMode: gameMode,
    score: score,
    answers: answers,
    badges: badges,
    date: new Date().toLocaleString()
  };

  var previousResults = JSON.parse(localStorage.getItem('mathGameResults')) || [];
  previousResults.push(result);
  localStorage.setItem('mathGameResults', JSON.stringify(previousResults));
}

// Toon eerdere resultaten
function displayPreviousResults() {
  var previousResults = JSON.parse(localStorage.getItem('mathGameResults')) || [];
  var resultsDisplay = `<h2>Previous Results</h2>`;
  if (previousResults.length > 0) {
    resultsDisplay += `<table>
      <tr><th>Date</th><th>Student</th><th>Score</th><th>Details</th></tr>`;
    previousResults.forEach((result, index) => {
      resultsDisplay += `<tr>
        <td>${result.date}</td>
        <td>${result.username}</td>
        <td>${result.score}/${result.numberOfQuestions}</td>
        <td><button onclick="viewResult(${index})">View</button></td>
      </tr>`;
    });
    resultsDisplay += `</table>`;
  } else {
    resultsDisplay += `<p>No previous results available.</p>`;
  }
  document.getElementById('previousResults').innerHTML = resultsDisplay;
}

// Toon gedetailleerde informatie over een geselecteerd resultaat
function viewResult(index) {
  var previousResults = JSON.parse(localStorage.getItem('mathGameResults')) || [];
  var result = previousResults[index];

  var resultDetails = `<h2>Result Details</h2>`;
  resultDetails += `<p>Student: ${result.username}</p>`;
  resultDetails += `<p>Tables Practiced: ${result.selectedTables.join(', ')}</p>`;
  resultDetails += `<p>Score: ${result.score} out of ${result.numberOfQuestions}</p>`;
  resultDetails += `<h3>Answers</h3>`;
  resultDetails += `<table>
    <tr><th>Question</th><th>Correct Answer</th><th>Your Answer</th><th>Time (s)</th></tr>`;
  result.answers.forEach(answer => {
    resultDetails += `<tr>
      <td>${answer.question}</td>
      <td>${answer.correctAnswer}</td>
      <td>${answer.userAnswer}</td>
      <td>${(answer.completionTime / 1000).toFixed(2)}</td>
    </tr>`;
  });
  resultDetails += `</table>`;

  var badgesDetails = `<h3>Badges Earned</h3>`;
  if (result.badges.length > 0) {
    result.badges.forEach(badge => {
      badgesDetails += `<p>${badge}</p>`;
    });
  } else {
    badgesDetails += `<p>No badges earned</p>`;
  }

  var detailedReportElement = document.getElementById('detailedReport');
  detailedReportElement.innerHTML = resultDetails + badgesDetails;

  // Scroll naar de gedetailleerde rapportage
  detailedReportElement.scrollIntoView({ behavior: 'smooth' });
}

// Beëindig spel en toon rapportage
function endGame() {
  clearInterval(timerInterval);

  awardBadges();  // Badges toekennen
  saveResult();   // Resultaat opslaan

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

  // Display badges
  var badgesDisplay = `<h2>Badges Earned</h2>`;
  if (badges.length > 0) {
    badges.forEach(badge => {
      badgesDisplay += `<p>${badge}</p>`;
    });
  } else {
    badgesDisplay += `<p>No badges earned</p>`;
  }
  document.getElementById('badges').innerHTML = badgesDisplay;

  // Display previous results
  displayPreviousResults();

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
  exerciseType = '';
  difficultyLevel = '';
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

// Voeg toetsenbordnavigatie toe voor een betere toegankelijkheid
document.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    if (document.getElementById('welcomeScreen').classList.contains('active')) {
      nextScreen('welcomeScreen', 'selectTablesScreen');
    } else if (document.getElementById('selectTablesScreen').classList.contains('active')) {
      nextScreen('selectTablesScreen', 'settingsScreen');
    } else if (document.getElementById('settingsScreen').classList.contains('active')) {
      startGame();
    }
  }
});
