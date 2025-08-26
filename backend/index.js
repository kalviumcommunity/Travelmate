// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = 8000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000", // React frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// API endpoint
app.post("/api/generate", async (req, res) => {
  const { prompt: userPrompt } = req.body;

  if (!userPrompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // 1. Define AI’s role
    const systemPrompt =
      "You are TravelMate, an expert travel planning assistant. Your goal is to provide clear, concise, and helpful travel recommendations.";

    // 2. Combine system + user prompt
    const fullPrompt = `${systemPrompt}\n\nUser Request: "${userPrompt}"`;

    // 3. Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // 4. Send response back to frontend
    res.json({ response: text });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
