function flashcardApp() {
    return {
        // State
        activeTab: 'start',
        gameStarted: false,
        sessionComplete: false,
        flashcardType: 'flip',
        sessionLength: 10,

        // Collections
        collections: {},
        selectedCollection: '',
        newCollectionName: '',
        newCollectionData: '',

        // CSV and Cards
        csvData: '',
        flashcards: [],
        currentCards: [],
        currentIndex: 0,

        // Game State
        isFlipped: false,
        correctAnswers: 0,
        incorrectCards: [],
        isReviewMode: false,

        // Input
        userAnswer: '',
        answerClass: '',
        feedbackMessage: '',

        // Default collections to load from CSV files
        defaultCollections: [
            'phrases-expats.csv',
            'phrases-idioms.csv',
            'phrases-proverbs.csv',
            'phrases-urban.csv',
            'vocab-emotions.csv',
            'vocab-food.csv',
            'vocab-travel.csv',
            'vocab-verbs.csv',
            'weather-vocabulary.csv'
        ],

        // Methods
        parseCSV(csvText) {
            return csvText.trim().split('\n').map(line => {
                let parts;
                if (line.includes(',')) {
                    parts = line.split(',');
                } else if (line.includes(';')) {
                    parts = line.split(';');
                } else {
                    return null;
                }

                if (parts.length >= 2) {
                    const swedish = parts[0].trim();
                    const english = parts[1].trim();
                    return { swedish, english };
                }
                return null;
            }).filter(card => card && card.swedish && card.english);
        },

        shuffleArray(array) {
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        },

        async loadDefaultCollections() {
            for (const filename of this.defaultCollections) {
                try {
                    const response = await fetch(`/flashcards/${filename}`);
                    if (response.ok) {
                        const csvData = await response.text();
                        // Extract collection name from filename (remove .csv extension)
                        const collectionName = filename.replace('.csv', '').replace(/-/g, ' ')
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ');
                        
                        // Only add if not already in collections (localStorage takes precedence)
                        if (!this.collections[collectionName]) {
                            this.collections[collectionName] = csvData.trim();
                        }
                    }
                } catch (error) {
                    console.warn(`Could not load ${filename}:`, error);
                }
            }
        },

        startFlashcards() {
            this.flashcards = this.parseCSV(this.csvData);

            if (this.flashcards.length === 0) {
                alert('Please enter valid CSV data');
                return;
            }

            // Shuffle all cards and take only the session length amount
            const shuffledCards = this.shuffleArray(this.flashcards);
            this.currentCards = shuffledCards.slice(0, parseInt(this.sessionLength));
            this.currentIndex = 0;
            this.correctAnswers = 0;
            this.incorrectCards = [];
            this.isReviewMode = false;
            this.sessionComplete = false;
            this.gameStarted = true;

            this.showCurrentCard();
        },

        showCurrentCard() {
            if (this.currentIndex >= this.currentCards.length) {
                this.sessionComplete = true;
                return;
            }

            this.isFlipped = false;
            this.userAnswer = '';
            this.answerClass = '';
            this.feedbackMessage = '';

            if (this.flashcardType === 'typing') {
                this.$nextTick(() => {
                    if (this.$refs.answerInput) {
                        this.$refs.answerInput.focus();
                    }
                });
            }
        },

        getCurrentCardWord() {
            if (this.currentIndex >= this.currentCards.length) return '';
            const card = this.currentCards[this.currentIndex];
            return this.flashcardType === 'typing' ? card.english : card.swedish;
        },

        getCurrentCardTranslation() {
            if (this.currentIndex >= this.currentCards.length) return '';
            const card = this.currentCards[this.currentIndex];
            return this.flashcardType === 'typing' ? card.swedish : card.english;
        },

        flipCard() {
            if (this.flashcardType !== 'flip' || this.isFlipped) return;
            this.isFlipped = true;
        },

        checkAnswer() {
            if (this.flashcardType !== 'typing' || this.isFlipped) return;

            const userAnswer = this.userAnswer.trim().toLowerCase();
            const correctAnswer = this.currentCards[this.currentIndex].swedish.toLowerCase();

            this.isFlipped = true;

            if (correctAnswer.includes(userAnswer) && userAnswer.length > 0) {
                this.answerClass = 'correct';
                this.feedbackMessage = '<div class="correct-answer">✓ Correct!</div>';
            } else {
                this.answerClass = 'incorrect';
                this.feedbackMessage = `<div class="incorrect-answer">✗ Incorrect<br>Correct answer: <strong>${this.currentCards[this.currentIndex].swedish}</strong></div>`;
            }
        },

        markCorrect() {
            this.correctAnswers++;
            this.nextCard();
        },

        markIncorrect() {
            this.incorrectCards.push(this.currentCards[this.currentIndex]);
            this.nextCard();
        },

        nextCard() {
            this.currentIndex++;
            this.showCurrentCard();
        },

        startReview() {
            this.currentCards = this.shuffleArray(this.incorrectCards);
            this.currentIndex = 0;
            this.correctAnswers = 0;
            const previousErrors = [...this.incorrectCards];
            this.incorrectCards = [];
            this.isReviewMode = true;
            this.sessionComplete = false;

            this.showCurrentCard();
        },

        resetSession() {
            this.gameStarted = false;
            this.sessionComplete = false;
        },

        // Collection Management
        async loadCollections() {
            const stored = localStorage.getItem('flashcardCollections');
            if (stored) {
                this.collections = JSON.parse(stored);
            }
            
            // Load default collections from CSV files
            await this.loadDefaultCollections();
        },

        loadCollection() {
            if (this.selectedCollection && this.collections[this.selectedCollection]) {
                this.csvData = this.collections[this.selectedCollection];
            }
        },

        saveCollection() {
            const name = this.newCollectionName.trim();
            const csvData = this.newCollectionData.trim();

            if (!name) {
                alert('Please enter a collection name');
                return;
            }

            if (!csvData) {
                alert('Please enter CSV data');
                return;
            }

            const flashcards = this.parseCSV(csvData);
            if (flashcards.length === 0) {
                alert('Please enter valid CSV data');
                return;
            }

            this.collections[name] = csvData;
            localStorage.setItem('flashcardCollections', JSON.stringify(this.collections));

            this.newCollectionName = '';
            this.newCollectionData = '';

            this.activeTab = 'start';
            this.selectedCollection = name;
            this.csvData = csvData;

            alert(`Collection "${name}" saved successfully!`);
        },

        deleteCollection() {
            if (!this.selectedCollection) {
                alert('Please select a collection to delete');
                return;
            }

            if (confirm(`Are you sure you want to delete the collection "${this.selectedCollection}"?`)) {
                delete this.collections[this.selectedCollection];
                localStorage.setItem('flashcardCollections', JSON.stringify(this.collections));

                this.csvData = '';
                this.selectedCollection = '';

                alert(`Collection deleted successfully!`);
            }
        }
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function (e) {
    const app = Alpine.$data(document.querySelector('[x-data]'));
    if (!app || !app.gameStarted || app.sessionComplete) return;

    if (document.activeElement.tagName === 'INPUT') {
        return; // Let Alpine handle Enter key in input
    }

    switch (e.key) {
        case ' ':
            e.preventDefault();
            if (app.flashcardType === 'flip' && !app.isFlipped) {
                app.flipCard();
            } else if (app.flashcardType === 'typing' && !app.isFlipped) {
                const input = document.querySelector('[x-ref="answerInput"]');
                if (input) input.focus();
            }
            break;
        case 'Enter':
            e.preventDefault();
            if (app.flashcardType === 'typing' && !app.isFlipped) {
                const input = document.querySelector('[x-ref="answerInput"]');
                if (input) input.focus();
            }
            break;
        case 'ArrowRight':
            e.preventDefault();
            if (app.isFlipped) {
                app.markCorrect();
            }
            break;
        case 'ArrowLeft':
            e.preventDefault();
            if (app.isFlipped) {
                app.markIncorrect();
            }
            break;
    }
});
