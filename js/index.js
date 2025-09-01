import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { db } from "../firebase.js";
import { updateGlobalScoreboard } from "../dbcalls.js";

const wordLists = {};  // key: letter, value: Set(words)
const loadingPromises = {}; // key: letter, value: Promise for loading
let topFive = [];
let topFiveGlobal = [];

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


async function loadWordList(letter) {
  if (wordLists[letter]) {
    // Already loaded
    return wordLists[letter];
  }
  if (loadingPromises[letter]) {
    // Loading in progress, wait for it
    return loadingPromises[letter];
  }

  // Start fetching
  loadingPromises[letter] = fetch(`/words/letters/${letter}.txt`)
    .then(response => response.text())
    .then(text => {
      const words = text.split('\n').map(w => w.trim().toLowerCase()).filter(Boolean);
      const wordSet = new Set(words);
      wordLists[letter] = wordSet;
      delete loadingPromises[letter]; // Clear loading promise
      return wordSet;
    })
    .catch(error => {
      console.error(`Error loading word list for ${letter}:`, error);
      delete loadingPromises[letter];
      return new Set();  // return empty set on error to avoid retry loop
    });

  return loadingPromises[letter];
}

// Function to check if a word exists using the WordsAPI
async function checkWordExistence(word) {
  word = word.toLowerCase()

  if (/^[,.?!]$/.test(word)) {
    // For punctuation, keep it unchanged (not highlighting punctuation)
    return false;
  } else if (word.length === 1){
    // Don't bother checking one letter words with the API
    return (word === 'a' || word === 'i');
  }

  const firstLetter = word[0];
  const wordSet = await loadWordList(firstLetter);
  return wordSet.has(word);
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

    return text;
}

function getWordsArrayFromText(text) {
    // Regular expression to split the text into words based on spaces, commas, periods, question marks, and exclamation points
    const wordPattern = /[a-zA-Z]+|[,.?!]/g;
    return text.match(wordPattern);
}

async function updateOutput(apiKey) {  
    const outputElement = document.getElementById('output');
    const text = generateRandomText(400);

    const words = getWordsArrayFromText(text);

    // Clear the output element before typing animation starts
    outputElement.textContent = '';
    
    // Fetch and store the span elements for each word in advance
    const spanElementPromises = words.map((word) => getSpanElementForWord(word, apiKey));

    // Render and animate each word
    let prevAnimation = Promise.resolve();
    for (let i = 0; i < words.length; i++) {
      const spanElement = await spanElementPromises[i];
      
      prevAnimation = prevAnimation.then(async () => {
        document.getElementById('output').appendChild(spanElement);
        await animateTypingWord(words[i] + " ", spanElement);
      });
    }

    await prevAnimation;

    highlightWords(outputElement);
  }

  async function getSpanElementForWord(word, apiKey){
    const exists = await checkWordExistence(word, apiKey);
    const spanElt = document.createElement("span");
    if(exists) {
      spanElt.className = "placeholder";
    }
    return spanElt;
  }

  function animateTypingWord(word, wordHtmlElt, currentIndex = 0, timeout = 10){
    return new Promise((resolve) => {
      if (currentIndex < word.length) {
        // Add one character to the outputElement
        wordHtmlElt.textContent += word.charAt(currentIndex);
  
        // Schedule the next character to be added after a short delay
        setTimeout(() => {
          animateTypingWord(word, wordHtmlElt, currentIndex + 1, timeout).then(resolve);
        }, timeout); // Adjust the delay as needed for desired typing speed
      } else {
        resolve(); // Resolve the promise when typing animation is complete
      }
    });
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
      }, 1000); // Adjust the delay time (in milliseconds) as needed
    }
  
    applyHighlight(0); // Start highlighting from the first span
  }

// Generate initial output on page load
animateTypingWord("monkey typewriter", document.getElementById("pageHeader"), 0, 100);
animateTypingWord("top 5 (personal)", document.getElementById("scoreboardHeader"), 0, 100);
animateTypingWord("top 5 (global)", document.getElementById("globalScoreboardHeader"), 0, 100);

// Get references to the input and button elements
const textInput = document.getElementById('textInput');
const generateButton = document.getElementById('generateButton');

// Function to handle button click
generateButton.addEventListener('click', async () => {
  const userInput = textInput.value;
    updateOutput(userInput);
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

listenToGlobalScoreboard();

