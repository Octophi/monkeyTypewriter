const apiUrl = 'https://wordsapiv1.p.rapidapi.com/words/';

// Function to check if a word exists using the WordsAPI
async function checkWordExistence(word, apiKey) {
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

    text += ' a i e j';
    return text;
}

async function updateOutput(apiKey) {
    // ... Same as before ...
  
    const outputElement = document.getElementById('output');
    const text = await generateRandomText(200);
  
    // Clear the output element before typing animation starts
    outputElement.textContent = '';
  
    // Start the typing animation and wait for it to complete
    await animateTyping(text, outputElement);
  
    // Highlight valid words after the typing animation is complete
    highlightValidWords(apiKey);
  }

  async function highlightValidWords(apiKey) {
    const outputElement = document.getElementById('output');
    const text = outputElement.textContent;
  
    // Regular expression to split the text into words based on spaces, commas, periods, question marks, and exclamation points
    const wordPattern = /[a-zA-Z]+|[,.?!]/g;
    const words = text.match(wordPattern);
  
    // Create a new highlightedText variable to store the modified output
    let highlightedText = '';
  
    for (const word of words) {
      if (/^[,.?!]$/.test(word)) {
        // For punctuation, keep it unchanged (not highlighting punctuation)
        highlightedText += `${word} `;
      } else if (word.length === 1){
        // Wrap the valid English words with a <span> element and apply the "highlight" CSS class
        const highlightedWord = (word === 'a' || word === 'i') ? `<span class="highlight">${word}</span>` : word;
  
        // Add the modified word (highlighted or not) to the highlightedText variable
        highlightedText += `${highlightedWord} `;
          
      }
      else {
        const exists = await checkWordExistence(word, apiKey);
  
        // Wrap the valid English words with a <span> element and apply the "highlight" CSS class
        const highlightedWord = exists ? `<span class="highlight">${word}</span>` : word;
  
        // Add the modified word (highlighted or not) to the highlightedText variable
        highlightedText += `${highlightedWord} `;
      }
    }
  
    // Update the output element with the highlighted text
    outputElement.innerHTML = highlightedText;
  }
  
// Function to animate text typing effect
function animateTyping(text, outputElement, currentIndex = 0, timeout = 10) {
    return new Promise((resolve) => {
      if (currentIndex < text.length) {
        // Add one character to the outputElement
        outputElement.textContent += text.charAt(currentIndex);
  
        // Schedule the next character to be added after a short delay
        setTimeout(() => {
          animateTyping(text, outputElement, currentIndex + 1, timeout).then(resolve);
        }, timeout); // Adjust the delay as needed for desired typing speed
      } else {
        resolve(); // Resolve the promise when typing animation is complete
      }
    });
  }

// Generate initial output on page load
animateTyping("monkey typewriter", document.getElementById("pageHeader"), 0, 100);

// Get references to the input and button elements
const textInput = document.getElementById('textInput');
const generateButton = document.getElementById('generateButton');

// Function to handle button click
generateButton.addEventListener('click', () => {
  const userInput = textInput.value;
  updateOutput(userInput);
});
