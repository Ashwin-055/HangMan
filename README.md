# 5-Letter Hangman Web App

A clean, modern, and interactive Hangman game optimized for GitHub Pages, featuring a 5-letter word dataset.
Extracted from Wikipedia Structured Dataset.

## 📁 File Structure
```
├── index.html          # Main HTML structure and UI
├── style.css           # Modern dark-mode styling and animations
├── script.js           # Game logic, Web Audio synthesizer, and CSV loader
└── 5LetterWords.csv    # Dataset of 5-letter English words extracted from Wikipedia Structured Dataset
```

## ✨ Features Included
- **Custom Word Bank**: Automatically fetches and parses words directly from `5LetterWords.csv`.
- **Responsive Layout**: Works seamlessly on mobile phones, tablets, and desktop screens.
- **Audio Sound FX**: Built-in sound effects generated via Web Audio API (no external mp3 files needed).
- **Stats Tracking**: Keeps track of Win Streak, High Score, and Total Wins using `localStorage`.
- **Dictionary Links**: Direct link on the Game Over screen to Wiktionary so players can check the meaning of obscure words.
