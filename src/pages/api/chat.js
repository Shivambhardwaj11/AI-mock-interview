import { GoogleGenerativeAI } from "@google/generative-ai";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ✅ AWS Polly Configuration
const pollyClient = new PollyClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.AMAZON_AWS_POLLY_ACCESS_KEY,
    secretAccessKey: process.env.AMAZON_AWS_POLLY_SECRET_KEY,
  },
});

// ✅ Google Gemini API Configuration
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export default async function handler(req, res) {
  const sessionResponse = {
    transcription: null,
    chatResponse: null,
    audioResponse: null,
    messages: req.body.messages || [],
  };

  try {
    // ✅ Use correct Gemini API model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // ✅ Fix request format
    const chatData = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: req.body.messages.map(msg => msg.content).join("\n") }],
        },
      ],
    });

    // ✅ Fix response extraction
    const reply =
      chatData.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Sorry, I couldn't generate a response.";

    sessionResponse.messages.push({ role: "assistant", content: reply });

    // ✅ AWS Polly (Text-to-Speech)
    const command = new SynthesizeSpeechCommand({
      Text: reply,
      OutputFormat: "mp3",
      VoiceId: req.body.voiceId || "Joanna",
      Engine: "neural",
    });

    const speechData = await pollyClient.send(command);
    const audioBuffer = Buffer.from(await speechData.AudioStream.transformToByteArray());
    const audioDataURI = `data:audio/mp3;base64,${audioBuffer.toString("base64")}`;

    sessionResponse.audio = { audioDataURI };
    res.status(200).json(sessionResponse);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: error.message });
  }
}
