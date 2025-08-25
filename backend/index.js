const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.send('TravelMate AI Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});