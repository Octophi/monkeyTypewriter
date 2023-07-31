// Replace 'YOUR_API_KEY' with your actual WordsAPI key
const apiKey = '';
const apiUrl = 'https://wordsapiv1.p.rapidapi.com/words/';

// Function to check if a word exists using the WordsAPI
async function checkWordExistence(word) {
  const url = `${apiUrl}${word}`;
  const headers = {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data.success !== false;
  } catch (error) {
    console.error('Error while checking word existence:', error);
    return false;
  }
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


// Array to store generated words
let generatedWords = [];

// Function to extract words from the generated text
function extractWords(text) {
    // Regular expression to match words (continuous string of alphabetical letters terminated by punctuation)
    const wordPattern = /[a-z]+[,.?! ]/gi;
    generatedWords = text.match(wordPattern).map((word) => word.trim());
}

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

    text += " surprise";

    return text;
}


// Function to update the displayed output
function updateOutput() {
    const outputElement = document.getElementById('output');
    const text = generateRandomText(200);
    extractWords(text); // Extract and store generated words
    outputElement.textContent = text;
}

async function highlightValidWords() {
    const outputElement = document.getElementById('output');
    const text = outputElement.textContent;
  
    // Split the text into words
    const words = text.split(/\s+/);
  
    // Create a new highlightedText variable to store the modified output
    let highlightedText = '';
  
    for (const word of words) {
      const exists = await checkWordExistence(word);
  
      // Wrap the valid English words with a <span> element and apply the "highlight" CSS class
      const highlightedWord = exists ? `<span class="highlight">${word}</span>` : word;
  
      // Add the modified word (highlighted or not) to the highlightedText variable
      highlightedText += `${highlightedWord} `;
    }
  
    // Update the output element with the highlighted text
    outputElement.innerHTML = highlightedText;
  }

// Generate initial output on page load
updateOutput();
highlightValidWords();