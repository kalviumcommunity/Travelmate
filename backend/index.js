// index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

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
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    // 1. Define system role
    const systemPrompt = `
      You are TravelMate, an expert travel planner. Based on the user's request, generate a structured travel plan.
      Your output MUST be a JSON object that strictly follows this schema:
      {
        "type": "object",
        "properties": {
          "places": {
            "type": "array",
            "description": "An array of recommended places to visit.",
            "items": { "type": "string" }
          },
          "transport": {
            "type": "string",
            "description": "A summary of transportation options."
          },
          "food": {
            "type": "array",
            "description": "An array of local foods or dishes to try.",
            "items": { "type": "string" }
          },
          "stay": {
            "type": "string",
            "description": "A recommendation for accommodation."
          }
        }
      }
    `;

    // 2. Combine system + user prompt
    const fullPrompt = `${systemPrompt}\n\nUser Request: "${userPrompt}"`;

    // 3. Configure model for JSON output
    const generationConfig = {
      responseMimeType: "application/json",
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
    });

    // 4. Call Gemini API
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    // 5. Parse JSON response safely
    const responseText = response.text();
    let parsedJson;
    try {
      parsedJson = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return res.status(500).json({ error: "Invalid response format from AI." });
    }

    // 6. Send structured response
    res.json({ response: parsedJson });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
