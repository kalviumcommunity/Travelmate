// index.js
import express from "express";
import cors from "cors";

const app = express();
const PORT = 8000;

// Middleware
app.use(cors({
  origin: "http://localhost:3000", // React frontend
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// API endpoint
app.post("/api/generate", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    // Placeholder: integrate with AI API later
    res.json({ response: `Received: ${prompt}` });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
