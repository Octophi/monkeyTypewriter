exports.handler = async (event, context) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ apiKey: process.env.WORDS_API_KEY })
  };
};