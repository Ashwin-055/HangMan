# 5-Letter Hangman Web App

A clean, modern, and interactive Hangman game optimized for GitHub Pages, featuring your custom 5-letter word dataset.

## 🚀 How to Host on GitHub Pages (Step-by-Step)

### Step 1: Create a GitHub Repository
1. Go to [GitHub](https://github.com) and click **New Repository**.
2. Name your repository (e.g., `hangman-game` or `5-letter-hangman`).
3. Select **Public**.
4. Click **Create repository**.

### Step 2: Add Files to Your Repository
1. In your newly created repository, click **Upload files**.
2. Drag and drop all the project files:
   - `index.html`
   - `style.css`
   - `script.js`
   - `5LetterWords.csv` (Your CSV file containing 2,256 words)
3. Click **Commit changes**.

### Step 3: Enable GitHub Pages
1. Go to your repository **Settings** (top right tab).
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** -> **Branch**:
   - Select `main` (or `master`)
   - Leave folder as `/ (root)`
4. Click **Save**.

🎉 Within 1-2 minutes, GitHub will provide a live URL to your game (e.g., `https://yourusername.github.io/hangman-game/`).

## 📁 File Structure
```
├── index.html          # Main HTML structure and UI
├── style.css           # Modern dark-mode styling and animations
├── script.js            # Game logic, Web Audio synthesizer, and CSV loader
└── 5LetterWords.csv    # Your dataset of 5-letter English words
```

## ✨ Features Included
- **Custom Word Bank**: Automatically fetches and parses words directly from `5LetterWords.csv`.
- **Responsive Layout**: Works seamlessly on mobile phones, tablets, and desktop screens.
- **Audio Sound FX**: Built-in sound effects generated via Web Audio API (no external mp3 files needed).
- **Stats Tracking**: Keeps track of Win Streak, High Score, and Total Wins using `localStorage`.
- **Dictionary Links**: Direct link on the Game Over screen to Wiktionary so players can check the meaning of obscure words.
