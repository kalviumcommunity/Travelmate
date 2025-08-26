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

// API endpoint
app.post("/api/generate", async (req, res) => {
  try {
    // --- MODIFIED: Destructure temperature too ---
    const { prompt: userPrompt, temperature } = req.body;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 1. Configure model with JSON output + temperature
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json", // Force JSON output
        temperature: temperature || 0.7,      // Default 0.7 if not provided
      },
    });

    // 2. Define schema/system prompt
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

    // 3. Start chat with few-shot examples (family, budget, food trips)
    const chat = model.startChat({
      history: [
        // --- Example 1: Family Trip ---
        {
          role: "user",
          parts: [
            {
              text: `${systemPrompt}

User Request: "Suggest 2 attractions in London for a family."`,
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

        // --- Example 2: Budget Trip ---
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

        // --- Example 3: Food-Focused Trip ---
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
      ],
    });

    // 4. Send the real user’s prompt
    const result = await chat.sendMessage(userPrompt);
    const response = await result.response;
    const text = response.text();

    // 5. Parse response safely
    let parsedJson;
    try {
      parsedJson = JSON.parse(text);
    } catch (e) {
      console.error("❌ Failed to parse AI response:", text);
      return res.status(500).json({ error: "AI response was not valid JSON." });
    }

    // 6. Send structured response
    res.json({ response: parsedJson });
  } catch (error) {
    console.error("❌ Error generating content:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
