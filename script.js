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

        // Table view
        searchQuery: '',
        filteredCards: [],

        // Speech (optional Azure settings, stored locally)
        speechKey: '',
        speechRegion: 'swedencentral',
        azureSynthesizer: null,

        // Keep a promise to avoid reloading the SDK
        azureSDKPromise: null,

        // Browser TTS state
        browserVoices: [],
        selectedSwedishVoice: null,

        // Default collections to load from CSV files
        defaultCollections: [
            'expressions-expats.csv',
            'expressions-urban.csv',
            'idioms.csv',
            'proverbs.csv',
            'vocabulary-emotions.csv',
            'vocabulary-food.csv',
            'vocabulary-travel.csv',
            'vocabulary-verbs.csv',
            'vocabulary-weather.csv',
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
            // Get the base path dynamically based on current location
            const currentPath = window.location.pathname;
            let basePath;
            
            if (window.location.hostname.includes('github.io')) {
                // For GitHub Pages, extract the repo name from the path
                const pathParts = currentPath.split('/').filter(part => part);
                if (pathParts.length > 0) {
                    // First part is the repo name on GitHub Pages
                    basePath = `/${pathParts[0]}/flashcards/`;
                } else {
                    basePath = '/flashcards/';
                }
            } else {
                // For local development or other hosting
                basePath = './flashcards/';
            }
            
            for (const filename of this.defaultCollections) {
                try {
                    const response = await fetch(`${basePath}${filename}`);
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
            // Load saved collections from localStorage
            const stored = localStorage.getItem('flashcardCollections');
            if (stored) {
                this.collections = JSON.parse(stored);
            }

            // Load saved speech settings
            const savedKey = localStorage.getItem('speechKey');
            const savedRegion = localStorage.getItem('speechRegion');
            if (savedKey) this.speechKey = savedKey;
            if (savedRegion) this.speechRegion = savedRegion;
            
            // Initialize Azure Speech if credentials exist
            if (this.speechKey && this.speechRegion) {
                this.initializeAzureSpeech();
            }

            // Load default collections from CSV files
            await this.loadDefaultCollections();

            // Init browser voices
            this.initVoices();

            // Preload Azure SDK if credentials already exist
            if (this.speechKey && this.speechRegion) {
                await this.ensureAzureSDKLoaded();
            }
        },

        initializeAzureSpeech() {
            try {
                if (!this.speechKey || !this.speechRegion) return;
                
                const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
                    this.speechKey,
                    this.speechRegion
                );
                speechConfig.speechSynthesisVoiceName = 'sv-SE-SofieNeural';
                
                this.azureSynthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);
                console.log('Azure Speech SDK initialized successfully');
            } catch (error) {
                console.error('Failed to initialize Azure Speech:', error);
                this.azureSynthesizer = null;
            }
        },

        initVoices() {
            if (!('speechSynthesis' in window)) return;
            const load = () => {
                this.browserVoices = window.speechSynthesis.getVoices() || [];
                this.selectedSwedishVoice = this.pickSwedishVoice();
            };
            load();
            // Some browsers load voices asynchronously
            if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
                window.speechSynthesis.onvoiceschanged = load;
            }
        },

        pickSwedishVoice() {
            if (!this.browserVoices.length) return null;
            const sv = this.browserVoices.filter(v => (v.lang || '').toLowerCase().startsWith('sv'));
            if (!sv.length) return null;
            // Prefer voices that look like sv-SE or named Sofie if available
            return sv.find(v => /sv[-_]se/i.test(v.lang) || /sofie/i.test(v.name)) || sv[0];
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
        },

        // Add new method for filtering cards
        filterCards() {
            if (!this.searchQuery.trim()) {
                this.filteredCards = [...this.flashcards];
                return;
            }

            const query = this.searchQuery.toLowerCase().trim();
            this.filteredCards = this.flashcards.filter(card => 
                card.swedish.toLowerCase().includes(query) || 
                card.english.toLowerCase().includes(query)
            );
        },

        // Add method to load collection for table view
        loadCollectionForTable() {
            if (this.selectedCollection && this.collections[this.selectedCollection]) {
                this.csvData = this.collections[this.selectedCollection];
                this.flashcards = this.parseCSV(this.csvData);
                this.filteredCards = [...this.flashcards];
                this.searchQuery = '';
            }
        },

        // Speech helpers
        speechEnabled() {
            // Azure is enabled if we have a valid synthesizer
            if (this.azureSynthesizer) return true;
            // Otherwise, browser speech is available
            return 'speechSynthesis' in window;
        },

        // Make credentials effective immediately and load SDK
        async saveSpeechSettings() {
            localStorage.setItem('speechKey', this.speechKey);
            localStorage.setItem('speechRegion', this.speechRegion);
            
            // Reinitialize Azure Speech with new credentials
            this.initializeAzureSpeech();
            
            alert('Speech settings saved!');
        },

        speakCurrentSwedish() {
            const card = this.currentCards[this.currentIndex];
            if (!card) return;

            const textToSpeak = card.swedish;

            // Try Azure first if available
            if (this.azureSynthesizer) {
                this.azureSynthesizer.speakTextAsync(
                    textToSpeak,
                    result => {
                        if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
                            console.log('Azure TTS completed');
                        } else {
                            console.error('Azure TTS failed:', result.errorDetails);
                            // Fall back to browser speech on error
                            this.speakWithBrowser(textToSpeak);
                        }
                    },
                    error => {
                        console.error('Azure TTS error:', error);
                        // Fall back to browser speech on error
                        this.speakWithBrowser(textToSpeak);
                    }
                );
            } else {
                // Use browser speech as fallback
                this.speakWithBrowser(textToSpeak);
            }
        },

        speakWithBrowser(text) {
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'sv-SE';
                utterance.rate = 0.9;
                window.speechSynthesis.speak(utterance);
            }
        },

        // Load SDK on demand so Azure is usable without reload
        async speakText(text) {
            // Prefer browser TTS
            if (this.speakWithBrowser(text)) return;

            // Fallback to Azure if configured
            if (this.speechKey && this.speechRegion) {
                if (!window.SpeechSDK) {
                    await this.ensureAzureSDKLoaded();
                }
                if (this.speakWithAzure(text)) return;
            }

            alert('No speech engine available. Enable browser TTS or configure Azure.');
        },

        getCurrentCardSwedish() {
            if (this.currentIndex >= this.currentCards.length) return '';
            return this.currentCards[this.currentIndex].swedish;
        },

        // Add: lazy loader for Azure Speech SDK
        ensureAzureSDKLoaded() {
            if (window.SpeechSDK) return Promise.resolve(true);
            if (this.azureSDKPromise) return this.azureSDKPromise;

            this.azureSDKPromise = new Promise((resolve) => {
                const scriptId = 'ms-cognitive-speech-sdk';
                const existing = document.getElementById(scriptId);
                if (existing) {
                    // If a tag exists but SDK not ready yet, wait for it
                    existing.addEventListener('load', () => resolve(!!window.SpeechSDK), { once: true });
                    existing.addEventListener('error', () => resolve(false), { once: true });
                    return;
                }
                const s = document.createElement('script');
                s.id = scriptId;
                s.async = true;
                s.src = 'https://cdn.jsdelivr.net/npm/microsoft-cognitiveservices-speech-sdk/distrib/browser/microsoft.cognitiveservices.speech.sdk.bundle.min.js';
                s.onload = () => resolve(!!window.SpeechSDK);
                s.onerror = () => resolve(false);
                document.head.appendChild(s);
            });

            return this.azureSDKPromise;
        },

        // Touch handling for swipe gestures
        touchStartX: 0,
        touchStartY: 0,
        touchMoved: false,
        
        onTouchStart(event) {
            if (this.flashcardType !== 'flip' || !this.isFlipped) {
                return;
            }
            this.touchStartX = event.touches[0].clientX;
            this.touchStartY = event.touches[0].clientY;
            this.touchMoved = false;
        },
        
        onTouchEnd(event) {
            if (this.flashcardType !== 'flip' || !this.isFlipped) {
                return;
            }
            
            const touchEndX = event.changedTouches[0].clientX;
            const touchEndY = event.changedTouches[0].clientY;
            
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            // Minimum swipe distance (50px)
            const minSwipeDistance = 50;
            
            // Check if horizontal swipe is dominant
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
                event.preventDefault();
                event.stopPropagation();
                this.touchMoved = true;
                
                if (deltaX > 0) {
                    // Swipe right - correct
                    this.markCorrect();
                } else {
                    // Swipe left - incorrect
                    this.markIncorrect();
                }
            }
        },
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
