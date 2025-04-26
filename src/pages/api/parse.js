require("dotenv").config({
  path: "./.env",
});

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export default async function handler(req, res) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Summarize the following job description into 50 words. Remove unnecessary characters, words, location, and compensation details. \n\n ${req.body.jobDescription}`;

  try {
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Error generating summary:", error);
    res.status(500).json({ error: error.message });
  }
}