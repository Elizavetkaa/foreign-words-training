const words = [
    { word: "Apple", translation: "Яблоко", example: "I ate an apple." },
    { word: "Book", translation: "Книга", example: "This is a good book." },
];

let currentIndex = 0;
let shuffledWords = [];
let testStartTime = null;
let correctAnswersCount = 0;
let totalQuestions = 0;
let testTimerInterval = null;

const cardFront = document.querySelector('#card-front h1');
const cardBackWord = document.querySelector('#card-back h1');
const cardBackExample = document.querySelector('#card-back span');
const flipCardElement = document.querySelector('.flip-card');

const backBtn = document.getElementById('back');
const nextBtn = document.getElementById('next');
const examBtn = document.getElementById('exam');
const shuffleBtn = document.getElementById('shuffle-words');

const studyProgressPercent = document.getElementById('study-percent');
const studyProgressBar = document.getElementById('study-progress');

const examPercentSpan = document.getElementById('correct-percent');
const examProgressBar = document.getElementById('exam-progress');

const timeSpan = document.getElementById('time');
const timerSpan = document.getElementById('timer');

const resultsModal = document.querySelector('.results-modal');
const resultsContent = resultsModal.querySelector('.results-content');

let mode = 'study';

flipCardElement.addEventListener('click', () => {
    flipCardElement.classList.toggle('active');
});

function showCard(index) {
    const wordObj = words[index];
    document.querySelector('#card-front h1').textContent = wordObj.word;
    document.querySelector('#card-back h1').textContent = wordObj.translation;
    document.querySelector('#card-back span').textContent = wordObj.example;
}

function updateNavigationButtons() {
    backBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === words.length - 1;
}

backBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        showCard(currentIndex);
        updateNavigationButtons();
        saveProgress();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        showCard(currentIndex);
        updateNavigationButtons();
        saveProgress();
    }
});

function shuffleWords() {
    shuffledWords = [...words];
    for (let i = shuffledWords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
    }
    currentIndex = 0;
    showShuffledCard(currentIndex);
}

function showShuffledCard(index) {
    const wordObj = shuffledWords[index];
    document.querySelector('#card-front h1').textContent = wordObj.word;
    document.querySelector('#card-back h1').textContent = wordObj.translation;
    document.querySelector('#card-back span').textContent = wordObj.example;
}

document.getElementById('shuffle-words').addEventListener('click', () => {
    shuffleWords();
});

let selectedCards = [];

document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', () => {
                if (mode !== 'exam') return;

                if (selectedCards.length >= 2) return;

                const frontH1 = card.querySelector('.flip-card-front h1');
                const backH1 = card.querySelector('.flip-card-back h1');

                let cardData = null;

                if (frontH1 && frontH1.textContent && backH1 && backH1.textContent) {
                    const wordText = frontH1.textContent.trim();
                    const translationText = backH1.textContent.trim();

                    cardData = { word: wordText, translation: translationText };

                    selectedCards.push({ element: card, data: cardData });

                    card.classList.add('selected');

                    if (selectedCards.length === 2) {
                        checkPair();
                    }
                }
            });

            function checkPair() {
                const [first, second] = selectedCards;


                let isMatch = false;

                if (
                    (first.data.word === second.data.word && first.data.translation === second.data.translation) ||
                    (first.data.word === second.data.translation && first.data.translation === second.data.word)
                ) {
                    isMatch = true;
                }

                if (isMatch) {
                    first.element.classList.add('fade-out');
                    second.element.classList.add('fade-out');

                    setTimeout(() => {
                        first.element.remove();
                        second.element.remove();

                        checkAllCardsGone();
                    }, 1500);

                    correctAnswersCount++;
                } else {
                    second.element.classList.add('wrong');

                    setTimeout(() => {
                        second.element.classList.remove('wrong');
                        first.element.classList.remove('selected');
                        second.element.classList.remove('selected');

                        selectedCards = [];
                    }, 500);
                }

                updateExamProgress();

            }

            function checkAllCardsGone() {
                if (document.querySelectorAll('.flip-card').length === 0) {
                    alert("Поздравляем! Вы прошли тестирование.");
                    stopTestTimer();
                    showResults();
                }
            }

            function startTest() {
                mode = 'exam';


                shuffledWords = [...words];

                for (let i = shuffledWords.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
                }

                totalQuestions = shuffledWords.length;

                correctAnswersCount = 0;

                renderTestCards();



                testStartTime = Date.now();
                startTestTimer();

            }

            function renderTestCards() {
                const container = document.getElementById('exam-cards');
                container.innerHTML = '';

                shuffledWords.forEach((wordObj, index) => {
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'flip-card';
                    cardDiv.dataset.index = index;

                    cardDiv.innerHTML = `<div class="flip-card-inner">
     <div class="flip-card-front">
       <h1>${wordObj.word}</h1>
     </div>
     <div class="flip-card-back">
       <h1>${wordObj.translation}</h1>
       <p><b>Пример:</b> ${wordObj.example}</p>
     </div>
   </div>`;

                    container.appendChild(cardDiv);

                    cardDiv.addEventListener('click', () => selectTestCard(cardDiv));
                });
            }
            let testSelected = [];

            function selectTestCard(card) {

                if (testSelected.length >= 2 || !card || !card.classList.contains('flip-card')) return;

                testSelected.push(card);

                if (testSelected.length === 2) {
                    checkTestPair(testSelected[0], testSelected[1]);
                }
            }

            function checkTestPair(cardA, cardB) {
                const indexA = parseInt(cardA.dataset.index);
                const indexB = parseInt(cardB.dataset.index);

                const wordA = shuffledWords[indexA];
                const wordB = shuffledWords[indexB];

                let isCorrect = false;

                if (
                    (wordA.word === wordB.word && wordA.translation === wordB.translation) ||
                    (wordA.word === wordB.translation && wordA.translation === wordB.word)
                ) { isCorrect = true; }

                if (isCorrect) {

                    [cardA, cardB].forEach(c => c.classList.add('correct'));

                    setTimeout(() => {
                        [cardA, cardB].forEach(c => c.classList.add('fade-out'));

                        setTimeout(() => {
                            [cardA, cardB].forEach(c => c.remove());
                            correctAnswersCount++;
                            checkAllTestCardsGone();
                        }, 1500);

                    }, 500);
                } else {

                    [cardA, cardB].forEach(c => c.classList.add('wrong'));

                    setTimeout(() => {
                        [cardA, cardB].forEach(c => {
                            c.classList.remove('wrong');
                            c.classList.remove('selected');
                        });

                        testSelected = [];

                    }, 1000);
                }
                updateExamProgress();
            }

            function checkAllTestCardsGone() {
                if (document.querySelectorAll('.flip-card').length === 0) {
                    alert("Тест завершен!");
                    stopTestTimer();
                    showResults();
                }
            }

            function startTestTimer() {
                timeSpan.textContent = '00:00';
                testTimerInterval = setInterval(() => {
                    const elapsed = Math.floor((Date.now() - testStartTime) / 1000);

                    let minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                    let seconds = (elapsed % 60).toString().padStart(2, '0');

                    timeSpan.textContent = `${minutes}:${seconds}`;

                }, 1000);
            }

            function stopTestTimer() {
                clearInterval(testTimerInterval);
            }

            function updateExamProgress() {
                let percent = Math.round((correctAnswersCount / totalQuestions) * 100);
                examPercentSpan.textContent = `${percent}%`;
                examProgressBar.style.width = `${percent}%`;
            }