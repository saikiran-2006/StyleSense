require("dotenv").config();

const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyze");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*" ? true : process.env.CORS_ORIGIN?.split(","),
  })
);

app.get("/", (req, res) => {
  res.send("StyleSense backend is running.");
});

app.use("/api", analyzeRoutes);

// Basic error handler (e.g. multer file-size errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "⚠️  GEMINI_API_KEY is not set. Copy .env.example to .env and add your key."
    );
  }
  console.log(`StyleSense backend running on http://localhost:${PORT}`);
});
