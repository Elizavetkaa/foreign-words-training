 const words = [
     { word: 'Apple', translation: 'Яблоко', example: 'I eat an apple.' },
     { word: 'Book', translation: 'Книга', example: 'This is a good book.' },
     { word: 'Car', translation: 'Машина', example: 'My car is fast.' },
     { word: 'Dog', translation: 'Собака', example: 'The dog is barking.' },
     { word: 'House', translation: 'Дом', example: 'They live in a big house.' }
 ];

 let currentIndex = 0;
 let mode = 'learn';
 let shuffledWords = [];
 let testSelected = [];
 let correctAnswersCount = 0;
 let totalQuestions = 0;
 let testStartTime = 0;
 let testTimerInterval = null;

 const cardWord = document.getElementById('card-word');
 const cardTranslation = document.getElementById('card-translation');
 const cardExample = document.getElementById('card-example');

 const prevBtn = document.getElementById('prevBtn');
 const nextBtn = document.getElementById('nextBtn');
 const shuffleBtn = document.getElementById('shuffleBtn');
 const startExamBtn = document.getElementById('startExamBtn');

 const mainCard = document.getElementById('main-card');

 const examSection = document.getElementById('exam-section');
 const examCardsContainer = document.getElementById('exam-cards');
 const examProgressBar = document.getElementById('exam-progress-bar');
 const timerSpan = document.getElementById('timer');

 function init() {
     showCard(currentIndex);
     updateNavigationButtons();
 }

 function showCard(index) {
     const wordObj = words[index];
     cardWord.textContent = wordObj.word;
     cardTranslation.textContent = wordObj.translation;
     cardExample.textContent = wordObj.example;
 }

 function updateNavigationButtons() {
     prevBtn.disabled = currentIndex === 0;
     nextBtn.disabled = currentIndex === words.length - 1;
 }

 backvBtn.addEventListener('click', () => {
     if (currentIndex > 0) {
         currentIndex--;
         showCard(currentIndex);
         updateNavigationButtons();
     }
 });
 nextBtn.addEventListener('click', () => {
     if (currentIndex < words.length - 1) {
         currentIndex++;
         showCard(currentIndex);
         updateNavigationButtons();
     }
 });

 shuffleBtn.addEventListener('click', () => {
     shuffleWords();
     currentIndex = 0;
     showCard(currentIndex);
     updateNavigationButtons();
 });

 startExamBtn.addEventListener('click', () => {
     startTest();
 });

 function shuffleWords() {
     shuffledWords = [...words];
     for (let i = shuffledWords.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]];
     }
 }

 function startTest() {
     mode = 'exam';
     document.getElementById('exam-section').style.display = 'block';
     shuffleWords();
     renderTestCards();
     correctAnswersCount = 0;
     totalQuestions = shuffledWords.length;
     updateExamProgress();
     testStartTime = Date.now();
     startTestTimer();
 }

 function renderTestCards() {
     examCardsContainer.innerHTML = '';

     shuffledWords.forEach((wordObj, index) => {
         const cardDiv = document.createElement('div');
         cardDiv.className = 'flip-card';
         cardDiv.dataset.index = index;

         cardDiv.innerHTML = `
      <div class="flip-card-inner">
        <div class="flip-card-front">
          <h1>${wordObj.word}</h1>
        </div>
        <div class="flip-card-back">
          <h1>${wordObj.translation}</h1>
          <p><b>Пример:</b> ${wordObj.example}</p>
        </div>
      </div>
    `;

         cardDiv.addEventListener('click', () => selectTestCard(cardDiv));

         examCardsContainer.appendChild(cardDiv);
     });
 }

 function selectTestCard(card) {
     if (testSelected.length >= 2 || !card || !card.classList.contains('flip-card')) return;
     if (testSelected.includes(card)) return;

     testSelected.push(card);
     card.classList.add('selected');

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
     ) {
         isCorrect = true;
     }

     if (isCorrect) {
         [cardA, cardB].forEach(c => c.classList.add('correct'));

         setTimeout(() => {
             [cardA, cardB].forEach(c => c.classList.add('fade-out'));
             setTimeout(() => {
                 [cardA, cardB].forEach(c => c.remove());
                 correctAnswersCount++;
                 checkAllTestCardsGone();
             }, 1000);
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

 function updateExamProgress() {
     const percent = Math.round((correctAnswersCount / totalQuestions) * 100);
     examProgressBar.style.width = percent + '%';
 }

 function startTestTimer() {
     timerSpan.textContent = '00:00';
     testTimerInterval = setInterval(() => {
         const elapsedSeconds = Math.floor((Date.now() - testStartTime) / 1000);
         const minutes = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
         const seconds = (elapsedSeconds % 60).toString().padStart(2, '0');
         timerSpan.textContent = `${minutes}:${seconds}`;
     }, 1000);
 }

 function stopTestTimer() {
     clearInterval(testTimerInterval);
 }

 function showResults() {
     alert(`Тест завершен!\nПравильных ответов: ${correctAnswersCount} из ${totalQuestions}`);
 }

 init();