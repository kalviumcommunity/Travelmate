# TravelMate

**Your Smart Travel Companion**

---

## Project Idea

TravelMate is a user-friendly AI-powered app designed to help travellers plan their trips with ease. Instead of spending hours researching, the app suggests everything in one place:

* Places to Visit
* Transportation Options
* Accommodation
* Food & Local Cuisine

It’s built to be simple, practical, and a fun way to showcase how modern apps can integrate multiple concepts like **prompting, RAG, structured output, and function calling** into one interactive travel experience.

---

## How It Works

1. **User Input** – The traveler enters their destination and preferences (budget, type of trip, food habits, etc.).
2. **Backend Processing** – The AI gathers context, retrieves useful information, and structures it into recommendations.
3. **Personalized Suggestions** – Using prompting + RAG, the app suggests places to visit, how to get around, where to stay, and what food to try.
4. **Output** – Results are displayed neatly in the UI with categories for easy navigation.

---

## AI Concepts in This Project

### 1. Prompting

We design prompts that combine location and user preferences for accurate suggestions.
Example:

"Suggest 5 tourist attractions in Paris for a student traveler with a low budget. Include transport options and food recommendations."

---

### 2. Structured Output

The AI returns results in a clear JSON format so the frontend can display them properly.

Example:

```json
{
  "places": ["Eiffel Tower", "Louvre Museum"],
  "transport": "Metro and walking are best for budget travel.",
  "food": "Try baguettes, crepes, and budget-friendly cafes.",
  "stay": "Look for hostels near Gare du Nord."
}
```

---

### 3. Function Calling

Different backend functions manage different needs:

* `getPlaces()` – Suggest attractions.
* `getTransportOptions()` – Suggest ways to travel locally.
* `getFood()` – Suggest local dishes.
* `getAccommodation()` – Suggest stays based on budget.

---

### 4. RAG (Retrieval-Augmented Generation)

Before finalizing suggestions, the AI fetches recent info from a small travel database.

Example:
User asks: *“I’m visiting Japan during cherry blossom season.”*
RAG fetches: Current festival details + travel advisories.
AI Output: Suggestions include **Hanami spots** and updated travel tips.

---

## Tech Stack

* **Frontend** – React + Tailwind
* **Backend** – Node.js + Express
* **AI** – Gemini API
* **RAG Source** – Travel DB + vector store

---
