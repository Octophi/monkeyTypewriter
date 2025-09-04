import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { updateGlobalScoreboard } from "../dbcalls.js";
import { db } from "../firebase.js";

// Load words.txt once and keep the Set in memory
let WORD_SET = null;
let wordSetLoadPromise = null;

function loadWordSetOnce() {
  if (WORD_SET) return Promise.resolve(WORD_SET);
  if (wordSetLoadPromise) return wordSetLoadPromise;

  wordSetLoadPromise = fetch('/words/words.txt')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(text => {
      const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
      WORD_SET = new Set(words);
      return WORD_SET;
    })
    .catch(error => {
      console.error('Error loading word list:', error);
      WORD_SET = new Set();
      return WORD_SET;
    })
    .finally(() => {
      // allow GC of the promise once settled; the data stays in WORD_SET
      wordSetLoadPromise = null;
    });

  return wordSetLoadPromise;
}

let topFive = [];
let topFiveGlobal = [];
let printShakespeare = false;

const listElement = document.getElementById('topFiveList');

listElement.innerHTML = '';

topFive.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item;
  listElement.appendChild(li);
});


function renderGlobalTopFiveList() {
  const listElement = document.getElementById('topFiveGlobal');
  listElement.innerHTML = ''; // Clear old list
  topFiveGlobal.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    listElement.appendChild(li);
  });
}

// Function to check if a word exists (sync version)
function checkWordExistence(word) {
  word = word.toLowerCase();

  if (/^[,.?!]$/.test(word)) {
    return false; // punctuation doesn't count
  } else if (word.length === 1) {
    return (word === 'a' || word === 'i');
  }

  // Ensure WORD_SET is loaded — fallback to false if not ready
  return WORD_SET ? WORD_SET.has(word) : false;
}

// Probabilities for each letter of the English alphabet and basic punctuation
const letterProbabilities = {
    'a': 8.167,
    'b': 1.492,
    'c': 2.782,
    'd': 4.253,
    'e': 12.702,
    'f': 2.228,
    'g': 2.015,
    'h': 6.094,
    'i': 6.966,
    'j': 0.153,
    'k': 0.772,
    'l': 4.025,
    'm': 2.406,
    'n': 6.749,
    'o': 7.507,
    'p': 1.929,
    'q': 0.095,
    'r': 5.987,
    's': 6.327,
    't': 9.056,
    'u': 2.758,
    'v': 0.978,
    'w': 2.360,
    'x': 0.150,
    'y': 1.974,
    'z': 0.074,
    ' ': 15,           // Space
    ',': 1.492,        // Comma
    '.': 1,            // Period
    '?': 0.150,        // Question mark
    '!': 0.074,        // Exclamation point
};

// Function to generate random text
function generateRandomText(length) {
    let text = '';
    if (printShakespeare) {
      text = "Two households, both alike in dignity, In fair Verona, where we lay our scene, From ancient grudge break to new mutiny, Where civil blood makes civil hands unclean. From forth the fatal loins of these two foes A pair of star-crossed lovers take their life; Whose misadventured piteous overthrows Do with their death bury their parents' strife. The fearful passage of their death-marked love, And...  "
    } else {
      const keys = Object.keys(letterProbabilities);
      const values = Object.values(letterProbabilities);
      const totalProbabilities = values.reduce((a, b) => a + b, 0);
  
      for (let i = 0; i < length; i++) {
          let random = Math.random() * totalProbabilities;
          let sum = 0;
          let index = 0;
  
          while (sum <= random) {
              sum += values[index];
              index++;
          }
  
          text += keys[index - 1];
      }
    }

    return text;
}

function getWordsArrayFromText(text) {
    // Regular expression to split the text into words based on spaces, commas, periods, question marks, and exclamation points
    const wordPattern = /[a-zA-Z]+|[,.?!]/g;
    return text.match(wordPattern);
}

async function updateOutput() {  
  const outputElement = document.getElementById('output');
  const text = generateRandomText(400);

  const words = getWordsArrayFromText(text);

  // Clear the output element before typing animation starts
  outputElement.textContent = '';

  // Pre-build span elements synchronously
  const spanElements = words.map(getSpanElementForWord);

  // Use a DocumentFragment to reduce reflows
  const fragment = document.createDocumentFragment();
  spanElements.forEach(span => fragment.appendChild(span));
  outputElement.appendChild(fragment);

  // Render + animate each word in sequence
  let prevAnimation = Promise.resolve();
  for (let i = 0; i < words.length; i++) {
    const spanElement = spanElements[i];
    prevAnimation = prevAnimation.then(() =>
      animateTypingWord(words[i] + " ", spanElement)
    );
  }

  await prevAnimation;

  highlightWords(outputElement);
}

  function getSpanElementForWord(word) {
    const exists = checkWordExistence(word);
    const spanElt = document.createElement("span");
    if (exists) {
      spanElt.className = "placeholder";
    }
    return spanElt;
  }

  async function animateTypingWord(word, wordHtmlElt, timeout = 10) {
    for (let i = 0; i < word.length; i++) {
      wordHtmlElt.textContent += word[i];
      // Wait for the specified timeout before next character
      await new Promise(resolve => setTimeout(resolve, timeout));
    }
  }

  function renderTopFiveList() {
    const listElement = document.getElementById('topFiveList');
    listElement.innerHTML = ''; // Clear old list
    topFive.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      listElement.appendChild(li);
    });
  }

  function addWordToScoreboard(word) {
    const lastTopFiveIdx = topFive.length - 1;
    if (topFive.includes(word)) return;
    if (topFive.length === 5 && word.length < (topFive[lastTopFiveIdx]?.length ?? 0)) return;
    topFive.push(word);
    topFive.sort((a,b,) => b.length - a.length)
    topFive.splice(5);
    renderTopFiveList();
  }

  function highlightWords(containerElt) {
    const highlightedSpanElts = containerElt.querySelectorAll('span.placeholder');
  
    async function applyHighlight(index) {
      if (index >= highlightedSpanElts.length) {
        await updateGlobalScoreboard(topFive, topFiveGlobal);
        return; // Base case: all spans have been highlighted
      }
  
      const highlightedSpanElt = highlightedSpanElts[index];
      highlightedSpanElt.className = 'highlight';
      addWordToScoreboard(highlightedSpanElt.textContent)
  
      setTimeout(() => {
        applyHighlight(index + 1); // Move on to the next span after a delay
      }, 300); // Adjust the delay time (in milliseconds) as needed
    }
  
    applyHighlight(0); // Start highlighting from the first span
  }

// Warm the word set cache at startup (non-blocking)
loadWordSetOnce();

// Generate initial output on page load
animateTypingWord("monkey typewriter", document.getElementById("pageHeader"), 100);
animateTypingWord("top 5 (personal)", document.getElementById("scoreboardHeader"), 100);
animateTypingWord("top 5 (global)", document.getElementById("globalScoreboardHeader"), 100);

// Get references to the input and button elements
const generateButton = document.getElementById('generateButton');

// Function to handle button click
generateButton.addEventListener('click', async () => {
    updateOutput();
});

function listenToGlobalScoreboard() {
  const globalScoreboardRef = doc(db, 'global-scoreboard', 'scoreboard');

  return onSnapshot(globalScoreboardRef, (docSnap) => {
    if (docSnap.exists()) {
      topFiveGlobal = docSnap.data().words || [];
      renderGlobalTopFiveList();
    } else {
      topFiveGlobal = [];
      renderGlobalTopFiveList();
    }
  }, (error) => {
    console.error('Error listening to global scoreboard:', error);
  });
}

// Listen for keydown events globally
document.addEventListener('keydown', (event) => {
  // You can add custom logic here, for example:
  if (event.key === 'Enter') {
    printShakespeare = !printShakespeare;
    console.log('Updating Result');
  }
});

listenToGlobalScoreboard();

