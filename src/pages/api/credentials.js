export default async function handler(req, res) {
  let tempMessages = [];

  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    tempMessages.push({
      role: "assistant",
      content: "Please set your Google Gemini API key in the .env file.",
    });
  }

  if (process.env.AMAZON_AWS_POLLY_ACCESS_KEY.length < 1) {
    tempMessages.push({
      role: "assistant",
      content: "Please set your Amazon AWS Polly access key in the .env file.",
    });
  }

  if (process.env.AMAZON_AWS_POLLY_SECRET_KEY.length < 1) {
    tempMessages.push({
      role: "assistant",
      content: "Please set your Amazon AWS Polly secret key in the .env file.",
    });
  }

  res.status(200).json({ messages: tempMessages });
}
