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
  res.send("✅ Backend is running");
});

// --- System Prompt ---
const systemPrompt = `
  You are TravelMate, an expert travel planner. 
  Based on the user's request, generate a structured travel plan.
  Your output MUST be a JSON object that strictly follows this schema:
  {
    "places": ["string", "string", ...], 
    "transport": "string", 
    "food": ["string", "string", ...], 
    "stay": "string"
  }
  Do not include any extra text, only return JSON.
`;

// --- Few-shot history examples ---
const multiShotHistory = [
  // Example 1: Family Trip
  {
    role: "user",
    parts: [
      {
        text: `${systemPrompt}\n\nUser Request: "Suggest 2 attractions in London for a family."`,
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"places": ["The British Museum", "Hyde Park"], "transport": "Use the Tube (subway) with an Oyster card.", "food": ["Fish and Chips from a local pub", "Afternoon tea"], "stay": "Consider family-friendly hotels in the South Kensington area."}`,
      },
    ],
  },

  // Example 2: Budget Trip
  {
    role: "user",
    parts: [{ text: "I want to visit Rome on a tight budget. Give me one idea." }],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"places": ["Pantheon"], "transport": "Walking is the best and cheapest way to see the city center.", "food": ["Pizza al taglio (pizza by the slice)"], "stay": "Look for a bed in a hostel near Termini Station."}`,
      },
    ],
  },

  // Example 3: Food-Focused Trip
  {
    role: "user",
    parts: [{ text: "I'm going to Tokyo and I only care about food. Suggest two things." }],
  },
  {
    role: "model",
    parts: [
      {
        text: `{"places": ["Tsukiji Outer Market", "Omoide Yokocho (Piss Alley)"], "transport": "Use the JR Yamanote Line and Tokyo Metro.", "food": ["Fresh sushi for breakfast", "Yakitori (grilled skewers)"], "stay": "Find a hotel in Shinjuku or Shibuya for easy access to food districts."}`,
      },
    ],
  },
];

// --- API Endpoint ---
app.post("/api/generate", async (req, res) => {
  try {
    // Destructure values from frontend
    const { prompt: userPrompt, temperature, topP, isFoodie } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // --- Dynamic Prompt Modification ---
    let finalUserPrompt = userPrompt;
    if (isFoodie) {
      finalUserPrompt =
        "IMPORTANT: Prioritize unique and local culinary experiences in your recommendations. The food suggestions should be the most detailed part of the response. " +
        userPrompt;
    }

    // Configure model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // enforce JSON output
        temperature: temperature ?? 0.7,
        topP: topP ?? 1.0,
      },
    });

    // Start chat with history
    const chat = model.startChat({ history: multiShotHistory });

    // Send final user prompt
    const result = await chat.sendMessage(finalUserPrompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON safely
    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch (e) {
      console.error("❌ Failed to parse AI response:", text);
      return res.status(500).json({ error: "AI response was not valid JSON." });
    }

    // Success
    res.json({ response: parsedJson });
  } catch (error) {
    console.error("❌ Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
