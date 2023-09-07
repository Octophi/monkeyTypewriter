const apiUrl = 'https://wordsapiv1.p.rapidapi.com/words/';

// Function to check if a word exists using the WordsAPI
async function checkWordExistence(word, apiKey) {

  if (/^[,.?!]$/.test(word)) {
    // For punctuation, keep it unchanged (not highlighting punctuation)
    return false;
  } else if (word.length === 1){
    // Don't bother checking one letter words with the API
    return (word === 'a' || word === 'i');
  }

  const url = `${apiUrl}${word}`;
  const headers = {
    'x-rapidapi-key': apiKey,
    'x-rapidapi-host': 'wordsapiv1.p.rapidapi.com',
  };

  try {
    const response = await fetch(url, { headers });
    const data = await response.json();
    return data.word;
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

    //const text = "i tkydrklyguftydrt me hello ";
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

  async function renderWord(word, apiKey) {
    const wordSpanElt = await getSpanElementForWord(word, apiKey); 
    document.getElementById('output').appendChild(wordSpanElt);
    await animateTypingWord(word + " ", wordSpanElt);
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

  function highlightWords(containerElt) {
    const highlightedSpanElts = containerElt.querySelectorAll('span.placeholder');
  
    function applyHighlight(index) {
      if (index >= highlightedSpanElts.length) {
        return; // Base case: all spans have been highlighted
      }
  
      const highlightedSpanElt = highlightedSpanElts[index];
      highlightedSpanElt.className = 'highlight';
  
      setTimeout(() => {
        applyHighlight(index + 1); // Move on to the next span after a delay
      }, 1000); // Adjust the delay time (in milliseconds) as needed
    }
  
    applyHighlight(0); // Start highlighting from the first span
  }

  async function fetchApiKey() {
    try {
      const response = await fetch('/.netlify/functions/apiKey');
      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
  }
  

// Generate initial output on page load
animateTypingWord("monkey typewriter", document.getElementById("pageHeader"), 0, 100);

// Get references to the input and button elements
const textInput = document.getElementById('textInput');
const generateButton = document.getElementById('generateButton');

// Function to handle button click
generateButton.addEventListener('click', async () => {
  const userInput = textInput.value;
  const apiKey = await fetchApiKey();
  if(userInput === 'makenew'){
    updateOutput(apiKey);
  } else {
    updateOutput(userInput);
  }
});


