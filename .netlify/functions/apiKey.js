export async function apiKey(event, context) {
    const apiKey = process.env.WORDS_API_KEY;
  
    return {
      statusCode: 200,
      body: JSON.stringify({ apiKey })
    };
  }
  