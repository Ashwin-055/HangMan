// 5-Letter Hangman Engine

// Keyboard layout
const KEYBOARD_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm']
];

// Fallback dictionary if CSV fetch is restricted locally
const FALLBACK_WORDS = [
    "AGORA", "BEACH", "CHAIR", "DREAM", "EAGLE", "FLAME", "GIANT",
    "HOUSE", "IMAGE", "JUICE", "KNIFE", "LEMON", "MUSIC", "NIGHT",
    "OCEAN", "PIANO", "QUEEN", "RIVER", "SNAKE", "TABLE", "UNION",
    "VOICE", "WATER", "YOUTH", "ZEBRA", "PRIDE", "MISER", "DUCHY",
    "HOVEL", "GLEBE", "SKENE", "ATOMY", "VINEA", "RANID", "RUNED"
];

let wordList = [];
let currentWord = "";
let guessedLetters = new Set();
let wrongCount = 0;
const MAX_WRONG = 6;
let soundEnabled = true;

// Stats
let stats = {
    streak: 0,
    bestStreak: 0,
    totalWins: 0
};

// Audio Synthesizer via Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (!soundEnabled) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (type === 'wrong') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, now);
            osc.frequency.exponentialRampToValueAtTime(110, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'win') {
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
            notes.forEach((freq, idx) => {
                const noteOsc = audioCtx.createOscillator();
                const noteGain = audioCtx.createGain();
                noteOsc.connect(noteGain);
                noteGain.connect(audioCtx.destination);
                noteOsc.frequency.setValueAtTime(freq, now + idx * 0.1);
                noteGain.gain.setValueAtTime(0.15, now + idx * 0.1);
                noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.2);
                noteOsc.start(now + idx * 0.1);
                noteOsc.stop(now + idx * 0.1 + 0.25);
            });
        } else if (type === 'lose') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    } catch (e) {
        // Fallback silently if audio context blocked
    }
}

// DOM Elements
const wordDisplayEl = document.getElementById('word-display');
const keyboardEl = document.getElementById('keyboard');
const livesCounterEl = document.getElementById('lives-counter');
const newGameBtn = document.getElementById('new-game-btn');
const soundToggleBtn = document.getElementById('sound-toggle-btn');
const currentStreakEl = document.getElementById('current-streak');
const bestStreakEl = document.getElementById('best-streak');
const totalWinsEl = document.getElementById('total-wins');

// Modal Elements
const modalEl = document.getElementById('modal');
const modalIconEl = document.getElementById('modal-icon');
const modalTitleEl = document.getElementById('modal-title');
const modalMsgEl = document.getElementById('modal-message');
const revealedWordEl = document.getElementById('revealed-word');
const dictLinkEl = document.getElementById('dict-link');
const modalActionBtn = document.getElementById('modal-action-btn');

// Initialize App
async function init() {
    loadStats();
    renderKeyboard();
    await loadWordList();
    startNewGame();

    // Event Listeners
    window.addEventListener('keydown', handleKeyPress);
    newGameBtn.addEventListener('click', () => startNewGame());
    modalActionBtn.addEventListener('click', () => {
        hideModal();
        startNewGame();
    });
    soundToggleBtn.addEventListener('click', toggleSound);
}

// Load words from 5LetterWords.csv
async function loadWordList() {
    try {
        const response = await fetch('5LetterWords.csv');
        if (!response.ok) throw new Error("CSV file not found");
        const text = await response.text();
        
        // Parse CSV lines
        const lines = text.split(/\r?\n/);
        const parsedWords = lines
            .map(line => line.trim().replace(/^["']|["']$/g, '').toUpperCase())
            .filter(word => word.length === 5 && /^[A-Z]{5}$/.test(word));

        if (parsedWords.length > 0) {
            wordList = parsedWords;
            console.log(`Loaded ${wordList.length} words from 5LetterWords.csv`);
        } else {
            throw new Error("No valid 5-letter words parsed from CSV");
        }
    } catch (err) {
        console.warn("Could not load 5LetterWords.csv (using fallback list):", err.message);
        wordList = FALLBACK_WORDS;
    }
}

function startNewGame() {
    if (wordList.length === 0) wordList = FALLBACK_WORDS;
    
    // Pick random word
    currentWord = wordList[Math.floor(Math.random() * wordList.length)].toUpperCase();
    guessedLetters.clear();
    wrongCount = 0;

    updateGallows();
    renderWordDisplay();
    resetKeyboard();
    updateStatsDisplay();
}

function renderWordDisplay() {
    wordDisplayEl.innerHTML = '';
    for (let i = 0; i < currentWord.length; i++) {
        const letter = currentWord[i];
        const slot = document.createElement('div');
        slot.classList.add('letter-slot');
        
        if (guessedLetters.has(letter.toLowerCase())) {
            slot.textContent = letter;
            slot.classList.add('revealed');
        } else {
            slot.textContent = '';
        }
        wordDisplayEl.appendChild(slot);
    }
}

function renderKeyboard() {
    keyboardEl.innerHTML = '';
    KEYBOARD_ROWS.forEach(row => {
        const rowEl = document.createElement('div');
        rowEl.classList.add('keyboard-row');
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.classList.add('key-btn');
            btn.textContent = key;
            btn.dataset.key = key;
            btn.addEventListener('click', () => makeGuess(key));
            rowEl.appendChild(btn);
        });
        keyboardEl.appendChild(rowEl);
    });
}

function resetKeyboard() {
    const keys = keyboardEl.querySelectorAll('.key-btn');
    keys.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

function handleKeyPress(e) {
    if (modalEl.classList.contains('hidden') === false) return;
    const key = e.key.toLowerCase();
    if (/^[a-z]$/.test(key)) {
        makeGuess(key);
    }
}

function makeGuess(letter) {
    letter = letter.toLowerCase();
    if (guessedLetters.has(letter) || wrongCount >= MAX_WRONG) return;

    guessedLetters.add(letter);
    const keyBtn = keyboardEl.querySelector(`[data-key="${letter}"]`);

    if (currentWord.toLowerCase().includes(letter)) {
        if (keyBtn) {
            keyBtn.classList.add('correct');
            keyBtn.disabled = true;
        }
        playSound('correct');
        renderWordDisplay();
        checkWin();
    } else {
        wrongCount++;
        if (keyBtn) {
            keyBtn.classList.add('wrong');
            keyBtn.disabled = true;
        }
        playSound('wrong');
        updateGallows();
        checkLoss();
    }
}

function updateGallows() {
    livesCounterEl.textContent = `${wrongCount} / ${MAX_WRONG}`;
    
    // Toggle body parts
    for (let i = 0; i < MAX_WRONG; i++) {
        const part = document.getElementById(`part-${i}`);
        if (part) {
            if (i < wrongCount) {
                part.classList.add('visible');
            } else {
                part.classList.remove('visible');
            }
        }
    }
}

function checkWin() {
    const isWon = currentWord.toLowerCase().split('').every(char => guessedLetters.has(char));
    if (isWon) {
        stats.streak++;
        stats.totalWins++;
        if (stats.streak > stats.bestStreak) stats.bestStreak = stats.streak;
        saveStats();
        playSound('win');

        showModal(
            '🎉',
            'Victory!',
            'You successfully uncovered the word!',
            currentWord
        );
    }
}

function checkLoss() {
    if (wrongCount >= MAX_WRONG) {
        stats.streak = 0;
        saveStats();
        playSound('lose');

        showModal(
            '💀',
            'Game Over',
            'Better luck next time!',
            currentWord
        );
    }
}

function showModal(icon, title, message, word) {
    modalIconEl.textContent = icon;
    modalTitleEl.textContent = title;
    modalMsgEl.textContent = message;
    revealedWordEl.textContent = word;
    dictLinkEl.href = `https://en.wiktionary.org/wiki/${word.toLowerCase()}`;
    
    setTimeout(() => {
        modalEl.classList.remove('hidden');
    }, 400);
}

function hideModal() {
    modalEl.classList.add('hidden');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊 Sound On' : '🔇 Sound Off';
}

function loadStats() {
    const saved = localStorage.getItem('hangman_stats');
    if (saved) {
        try { stats = JSON.parse(saved); } catch(e){}
    }
    updateStatsDisplay();
}

function saveStats() {
    localStorage.setItem('hangman_stats', JSON.stringify(stats));
    updateStatsDisplay();
}

function updateStatsDisplay() {
    currentStreakEl.textContent = stats.streak;
    bestStreakEl.textContent = stats.bestStreak;
    totalWinsEl.textContent = stats.totalWins;
}

// Start app
init();
