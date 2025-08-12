document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const creatorSection = document.getElementById('creator-section');
    const takerSection = document.getElementById('taker-section');
    const quizSection = document.getElementById('quiz-section');
    const shareSection = document.getElementById('share-section');
    const scoreboardSection = document.getElementById('scoreboard-section');
    const resultSection = document.getElementById('result-section');

    const creatorNameInput = document.getElementById('creator-name');
    const takerNameInput = document.getElementById('taker-name');
    const questionsContainer = document.getElementById('questions-container');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    // === Global State ===
    const allQuestions = [
      { question: "What's my favorite animal?", options: ["Dog", "Cat", "Rabbit"], correctAnswer: "Dog" },
      { question: "What's my favorite food?", options: ["Pizza", "Tacos", "Burger"], correctAnswer: "Pizza" },
      { question: "What's my biggest fear?", options: ["Spiders", "Heights", "Public speaking"], correctAnswer: "Heights" },
      { question: "Am I a morning person or a night owl?", options: ["Morning person", "Night owl", "Both"], correctAnswer: "Both" },
      { question: "Which season do I love most?", options: ["Winter", "Spring", "Summer", "Autumn"], correctAnswer: "Summer" },
      { question: "If I could travel anywhere, where would I go?", options: ["Japan", "Italy", "New York"], correctAnswer: "Japan" },
      { question: "My ideal weekend is...", options: ["Staying in and relaxing", "Going out with friends", "Exploring a new place"], correctAnswer: "Staying in and relaxing" },
      { question: "What's my favorite type of music?", options: ["Pop", "Rock", "Hip Hop", "Classical"], correctAnswer: "Pop" },
      { question: "My go-to coffee order is...", options: ["Latte", "Espresso", "Americano"], correctAnswer: "Latte" },
      { question: "Which superpower would I choose?", options: ["Flight", "Invisibility", "Teleportation"], correctAnswer: "Teleportation" },
      { question: "Am I an introvert or an extrovert?", options: ["Introvert", "Extrovert"], correctAnswer: "Introvert" },
      { question: "Which social media app do I use the most?", options: ["Instagram", "TikTok", "X", "Snapchat"], correctAnswer: "Instagram" },
      { question: "My favorite color is...", options: ["Blue", "Red", "Green", "Yellow"], correctAnswer: "Green" },
      { question: "Which movie genre do I prefer?", options: ["Comedy", "Horror", "Action", "Romance"], correctAnswer: "Action" },
      { question: "What's my favorite thing to do on a day off?", options: ["Watch movies", "Read a book", "Go for a hike", "Sleep"], correctAnswer: "Sleep" },
      { question: "Do I prefer a big party or a small gathering?", options: ["Big party", "Small gathering"], correctAnswer: "Small gathering" },
      { question: "Which fruit do I like best?", options: ["Apple", "Banana", "Orange", "Mango"], correctAnswer: "Mango" },
      { question: "What's my favorite type of weather?", options: ["Sunny", "Rainy", "Snowy", "Windy"], correctAnswer: "Sunny" },
      { question: "Do I prefer salty or sweet snacks?", options: ["Salty", "Sweet"], correctAnswer: "Sweet" },
      { question: "Which video game console do I prefer?", options: ["PlayStation", "Xbox", "Nintendo"], correctAnswer: "PlayStation" },
      { question: "What's my dream job?", options: ["Artist", "Programmer", "Doctor", "Teacher"], correctAnswer: "Programmer" },
      { question: "Do I have any pets?", options: ["Yes", "No"], correctAnswer: "No" },
      { question: "What's my favorite holiday?", options: ["Christmas", "New Year's", "Halloween"], correctAnswer: "Christmas" },
      { question: "My favorite type of clothing is...", options: ["Casual", "Formal", "Sporty"], correctAnswer: "Casual" },
      { question: "What's my favorite form of exercise?", options: ["Running", "Weightlifting", "Yoga", "Swimming"], correctAnswer: "Swimming" },
      { question: "Do I prefer watching movies at home or in a theater?", options: ["At home", "In a theater"], correctAnswer: "At home" },
      { question: "What's my favorite animal sound?", options: ["Lion's roar", "Bird's chirp", "Cat's meow"], correctAnswer: "Cat's meow" },
      { question: "Which fictional character do I relate to most?", options: ["Harry Potter", "Frodo Baggins", "Sherlock Holmes"], correctAnswer: "Harry Potter" },
      { question: "What's my favorite beverage?", options: ["Water", "Juice", "Soda"], correctAnswer: "Juice" },
      { question: "Am I a messy or a tidy person?", options: ["Messy", "Tidy"], correctAnswer: "Tidy" },
      { question: "What's my favorite type of book?", options: ["Fantasy", "Science Fiction", "Mystery"], correctAnswer: "Fantasy" },
      { question: "Which instrument would I love to learn?", options: ["Guitar", "Piano", "Drums"], correctAnswer: "Piano" },
      { question: "My favorite kind of sandwich is...", options: ["Turkey", "Ham and cheese", "Tuna salad"], correctAnswer: "Turkey" }
    ];
    
    let currentQuizQuestions = [];
    let creatorAnswers = [];
    let currentQuestionIndex = 0;
    let quizId = null;

    // === URL Logic to Determine View ===
    const urlParams = new URLSearchParams(window.location.search);
    quizId = urlParams.get('id');
    const view = urlParams.get('view');

    if (quizId && view === 'scoreboard') {
        // Show Scoreboard
        showView(scoreboardSection);
        loadScoreboard(quizId);
    } else if (quizId) {
        // Show Taker Section (friend)
        showView(takerSection);
    } else {
        // Show Creator Section
        showView(creatorSection);
    }

    function showView(section) {
        [creatorSection, takerSection, quizSection, shareSection, scoreboardSection, resultSection].forEach(s => {
            s.style.display = 'none';
        });
        section.style.display = 'block';
    }

    // === Helper Functions ===
    function generateQuizID(length = 8) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    }

    function renderQuestion(questions, userAnswers) {
        if (questions.length === 0) return;

        const questionData = questions[currentQuestionIndex];
        const selectedOption = userAnswers[currentQuestionIndex];

        questionsContainer.innerHTML = `
            <h3>${currentQuestionIndex + 1}. ${questionData.question}</h3>
            <div class="quiz-options">
                ${questionData.options.map(option => `
                    <div class="quiz-option ${selectedOption === option ? 'selected' : ''}" data-value="${option}">
                        ${option}
                    </div>
                `).join('')}
            </div>
        `;
        // Add event listeners for option clicks
        document.querySelectorAll('.quiz-option').forEach(optionEl => {
            optionEl.addEventListener('click', () => {
                document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
                optionEl.classList.add('selected');
            });
        });
    }

    // === Creator Flow ===
    document.getElementById('create-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const creatorName = creatorNameInput.value.trim();
        if (!creatorName) return;

        // **Randomly select 15 questions**
        currentQuizQuestions = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, 15);
        creatorAnswers = Array(currentQuizQuestions.length).fill(null);

        showView(quizSection);
        renderQuestion(currentQuizQuestions, creatorAnswers);
    });

    // === Quiz Taker Flow ===
    document.getElementById('take-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const takerName = takerNameInput.value.trim();
        if (!takerName) return;

        database.ref(`quizzes/${quizId}`).once('value').then(snapshot => {
            const quizData = snapshot.val();
            if (quizData) {
                currentQuizQuestions = quizData.questions;
                takerAnswers = Array(currentQuizQuestions.length).fill(null);
                showView(quizSection);
                renderQuestion(currentQuizQuestions, takerAnswers);
                document.getElementById('quiz-heading').innerText = `${quizData.creatorName}'s Quiz`;
            } else {
                alert("Quiz not found!");
                window.location.href = 'index.html';
            }
        });
    });

    // === Quiz Navigation Logic (for both creator and taker) ===
    nextBtn.addEventListener('click', () => {
        const selected = document.querySelector('.quiz-option.selected');
        if (!selected) {
            alert("Please select an answer.");
            return;
        }

        const answersArray = quizId ? takerAnswers : creatorAnswers;
        answersArray[currentQuestionIndex] = selected.dataset.value;

        if (currentQuestionIndex < currentQuizQuestions.length - 1) {
            currentQuestionIndex++;
            renderQuestion(currentQuizQuestions, answersArray);
        }

        // Show/hide buttons
        prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentQuestionIndex < currentQuizQuestions.length - 1 ? 'block' : 'none';
        submitBtn.style.display = currentQuestionIndex === currentQuizQuestions.length - 1 ? 'block' : 'none';
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            const answersArray = quizId ? takerAnswers : creatorAnswers;
            renderQuestion(currentQuizQuestions, answersArray);
        }
        prevBtn.style.display = currentQuestionIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentQuizQuestions.length > 1 && currentQuestionIndex < currentQuizQuestions.length - 1 ? 'block' : 'none';
        submitBtn.style.display = currentQuestionIndex === currentQuizQuestions.length - 1 ? 'block' : 'none';
    });

    // === Submit Logic (for both creator and taker) ===
    submitBtn.addEventListener('click', () => {
        const selected = document.querySelector('.quiz-option.selected');
        if (!selected) {
            alert("Please select an answer.");
            return;
        }
        
        const answersArray = quizId ? takerAnswers : creatorAnswers;
        answersArray[currentQuestionIndex] = selected.dataset.value;

        if (quizId) {
            // Friend submitting the quiz
            database.ref(`quizzes/${quizId}`).once('value').then(snapshot => {
                const quizData = snapshot.val();
                let score = 0;
                answersArray.forEach((answer, index) => {
                    if (answer === quizData.questions[index].correctAnswer) {
                        score++;
                    }
                });
                
                database.ref(`quizzes/${quizId}/scores`).push({
                    friendName: takerNameInput.value.trim(),
                    score: score,
                    timestamp: firebase.database.ServerValue.TIMESTAMP
                }).then(() => {
                    showView(resultSection);
                    document.getElementById('final-score').innerText = `${score} / ${currentQuizQuestions.length}`;
                });
            });
        } else {
            // Creator submitting the quiz
            const newQuizId = generateQuizID();
            const creatorName = creatorNameInput.value.trim();
            database.ref(`quizzes/${newQuizId}`).set({
                creatorName: creatorName,
                questions: currentQuizQuestions,
                scores: {}
            }).then(() => {
                showView(shareSection);
                const quizLink = `${window.location.origin}/?id=${newQuizId}`;
                document.getElementById('share-link').value = quizLink;
                document.getElementById('view-results-link').href = `/?id=${newQuizId}&view=scoreboard`;
            });
        }
    });

    // === Scoreboard Logic ===
    function loadScoreboard(id) {
        database.ref(`quizzes/${id}`).once('value').then(snapshot => {
            const quizData = snapshot.val();
            if (quizData && quizData.scores) {
                document.getElementById('scoreboard-heading').innerText = `${quizData.creatorName}'s Quiz Scores`;
                const scoresList = document.getElementById('scores-list');
                scoresList.innerHTML = '';
                const scores = Object.values(quizData.scores);
                scores.sort((a, b) => b.score - a.score);
                scores.forEach(score => {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${score.friendName}</strong><span>${score.score} / ${quizData.questions.length}</span>`;
                    scoresList.appendChild(li);
                });
            } else {
                alert("No scores found yet.");
                window.location.href = `/?id=${id}`;
            }
        });
    }

    // === Copy Link Functionality ===
    document.querySelector('.copy-btn').addEventListener('click', () => {
        const linkInput = document.getElementById('share-link');
        linkInput.select();
        document.execCommand('copy');
        alert("Link copied to clipboard!");
    });
});
