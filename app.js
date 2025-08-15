document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const creatorSection = document.getElementById('creator-section');
    const takerSection = document.getElementById('taker-section');
    const quizSection = document.getElementById('quiz-section');
    const shareSection = document.getElementById('share-section');
    const scoreboardSection = document.getElementById('scoreboard-section');
    const resultSection = document.getElementById('result-section');
    const recentQuizzesSection = document.getElementById('recent-quizzes-section');
    // New: Creator Dashboard elements
    const creatorDashboard = document.getElementById('creator-dashboard');
    const creatorQuizzesList = document.getElementById('creator-quizzes-list');
    const goToDashboardBtn = document.getElementById('go-to-dashboard-btn');
    const createNewQuizBtn = document.getElementById('create-new-quiz-btn');

    const creatorNameInput = document.getElementById('creator-name');
    const takerNameInput = document.getElementById('taker-name');
    const questionsContainer = document.getElementById('questions-container');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const submitBtn = document.getElementById('submit-btn');

    // === Global State ===
    // The allQuestions array is now loaded from questions.js
    let currentQuizQuestions = [];
    let creatorAnswers = [];
    let currentQuestionIndex = 0;
    let quizId = null;

    // === URL Logic to Determine View ===
    const urlParams = new URLSearchParams(window.location.search);
    quizId = urlParams.get('id');
    const view = urlParams.get('view');

    function showView(section) {
        [creatorSection, takerSection, quizSection, shareSection, scoreboardSection, resultSection, recentQuizzesSection, creatorDashboard].forEach(s => {
            s.style.display = 'none';
        });
        section.style.display = 'block';
    }

    const finalQuizResult = JSON.parse(localStorage.getItem('finalQuizResult'));

    // New: Check if the user is a creator and has quizzes
    const creatorQuizzes = JSON.parse(localStorage.getItem('myCreatedQuizzes')) || [];

    if (finalQuizResult) {
        showView(resultSection);
        document.getElementById('final-score').innerText = `${finalQuizResult.score} / ${finalQuizResult.totalQuestions}`;
        // Clear the stored result after displaying it
        localStorage.removeItem('finalQuizResult');
    } else if (quizId && view === 'scoreboard') {
        showView(scoreboardSection);
        loadScoreboard(quizId);
    } else if (quizId) {
        showView(takerSection);
    } else if (creatorQuizzes.length > 0) {
        // If the user has created quizzes, show their dashboard
        showView(creatorDashboard);
        loadCreatorDashboard(creatorQuizzes);
    } else {
        showView(creatorSection);
        loadRecentQuizzes();
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
        document.querySelectorAll('.quiz-option').forEach(optionEl => {
            optionEl.addEventListener('click', () => {
                document.querySelectorAll('.quiz-option').forEach(el => el.classList.remove('selected'));
                optionEl.classList.add('selected');
            });
        });
    }
    
    // New: Function to load quizzes from local storage
    function loadRecentQuizzes() {
        const storedResults = JSON.parse(localStorage.getItem('buddyzResults')) || [];
        const container = document.getElementById('recent-quizzes-container');
        container.innerHTML = '';

        if (storedResults.length === 0) {
            recentQuizzesSection.style.display = 'none';
            return;
        }
        
        recentQuizzesSection.style.display = 'block';

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const todayQuizzes = storedResults.filter(r => r.date.startsWith(today));
        const yesterdayQuizzes = storedResults.filter(r => r.date.startsWith(yesterday) && !r.date.startsWith(today));
        const olderQuizzes = storedResults.filter(r => !r.date.startsWith(today) && !r.date.startsWith(yesterday));

        const createSection = (title, quizzes) => {
            if (quizzes.length === 0) return;
            const sectionHtml = `
                <h4>${title}</h4>
                <ul id="recent-${title.toLowerCase().replace(' ', '-')}-list" class="scores-list">
                    ${quizzes.map(q => `
                        <li>
                            <span><strong>${q.friendName}</strong> scored <strong>${q.score} / ${q.totalQuestions}</strong> on <strong>${q.creatorName}'s</strong> quiz.</span>
                            <a href="?id=${q.quizId}&view=scoreboard" class="btn small-btn secondary-btn">View Scoreboard</a>
                        </li>
                    `).join('')}
                </ul>
            `;
            container.innerHTML += sectionHtml;
        };

        createSection("Today", todayQuizzes);
        createSection("Yesterday", yesterdayQuizzes);
        createSection("Older", olderQuizzes);
    }
    
    // New: Function to load the Creator Dashboard
    function loadCreatorDashboard(quizzes) {
        if (quizzes.length === 0) {
            creatorQuizzesList.innerHTML = `<p>You haven't created any quizzes yet.</p>`;
            return;
        }

        creatorQuizzesList.innerHTML = `<ul></ul>`;
        const quizListEl = creatorQuizzesList.querySelector('ul');
        
        quizzes.forEach(quiz => {
            const li = document.createElement('li');
            const quizTitle = `${quiz.creatorName}'s Quiz (${quiz.quizId})`;
            li.innerHTML = `
                <div>
                    <h3>${quizTitle}</h3>
                    <p id="takers-count-${quiz.quizId}">Loading takers...</p>
                </div>
                <a href="?id=${quiz.quizId}&view=scoreboard" class="btn small-btn secondary-btn">View Results</a>
            `;
            quizListEl.appendChild(li);

            // Fetch the number of takers from Firebase
            database.ref(`quizzes/${quiz.quizId}/scores`).once('value').then(snapshot => {
                const scores = snapshot.val();
                const takersCount = scores ? Object.keys(scores).length : 0;
                document.getElementById(`takers-count-${quiz.quizId}`).innerText = `${takersCount} Taker${takersCount !== 1 ? 's' : ''}`;
            });
        });
    }


    // === Creator Flow ===
    document.getElementById('create-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const creatorName = creatorNameInput.value.trim();
        if (!creatorName) return;

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
                    const quizResult = {
                        quizId: quizId,
                        creatorName: quizData.creatorName,
                        friendName: takerNameInput.value.trim(),
                        score: score,
                        totalQuestions: currentQuizQuestions.length,
                        date: new Date().toISOString()
                    };
                    const storedResults = JSON.parse(localStorage.getItem('buddyzResults')) || [];
                    storedResults.unshift(quizResult);
                    localStorage.setItem('buddyzResults', JSON.stringify(storedResults));
                    
                    const finalScoreData = {
                        score: score,
                        totalQuestions: currentQuizQuestions.length
                    };
                    localStorage.setItem('finalQuizResult', JSON.stringify(finalScoreData));

                    showView(resultSection);
                    document.getElementById('final-score').innerText = `${score} / ${currentQuizQuestions.length}`;
                });
            });
        } else {
            currentQuizQuestions.forEach((question, index) => {
                question.correctAnswer = creatorAnswers[index];
            });

            const newQuizId = generateQuizID();
            const creatorName = creatorNameInput.value.trim();
            database.ref(`quizzes/${newQuizId}`).set({
                creatorName: creatorName,
                questions: currentQuizQuestions,
                scores: {}
            }).then(() => {
                // New: Save the created quiz to the creator's dashboard list in localStorage
                const myQuizzes = JSON.parse(localStorage.getItem('myCreatedQuizzes')) || [];
                myQuizzes.unshift({
                    quizId: newQuizId,
                    creatorName: creatorName
                });
                localStorage.setItem('myCreatedQuizzes', JSON.stringify(myQuizzes));

                showView(shareSection);
                const quizLink = `${window.location.href.split('?')[0]}?id=${newQuizId}`;
                document.getElementById('share-link').value = quizLink;
                document.getElementById('view-results-link').href = `?id=${newQuizId}&view=scoreboard`;
            });
        }
    });

    // New: Dashboard button logic
    goToDashboardBtn.addEventListener('click', () => {
        showView(creatorDashboard);
        const creatorQuizzes = JSON.parse(localStorage.getItem('myCreatedQuizzes')) || [];
        loadCreatorDashboard(creatorQuizzes);
    });

    // New: Create New Quiz button logic
    createNewQuizBtn.addEventListener('click', () => {
        showView(creatorSection);
        loadRecentQuizzes(); // Show recent quizzes on the new home screen
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
                alert("No scores found yet. Be the first to take the quiz!");
                // New: Redirect to the home page if no scores
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

