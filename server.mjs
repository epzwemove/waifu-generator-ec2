// server.mjs

import express from "express";
import fetch from "node-fetch";
import FormData from "form-data";  // Import FormData
import cors from "cors";

const app = express();
const PORT = 5000;

// Enable CORS
app.use(cors());

// Middleware to parse JSON requests
app.use(express.json());

// POST endpoint for /api/generate-waifu
app.post("/api/generate-waifu", async (req, res) => {
  const apiKey = "sk-FnLcJv18jt4ZiO009TE9KVqX5Li4zvVJtDN5XznpfaebnIia"; // Your Stability AI API key
  const { prompt, aspect_ratio, output_format, model, seed, style_preset } = req.body;

  // Create FormData for multipart/form-data
  const formData = new FormData();
  formData.append("prompt", prompt);
  if (aspect_ratio) formData.append("aspect_ratio", aspect_ratio);
  if (output_format) formData.append("output_format", output_format);
  if (model) formData.append("model", model);
  if (seed) formData.append("seed", seed);
  if (style_preset) formData.append("style_preset", style_preset);

  try {
    const response = await fetch("https://api.stability.ai/v2beta/stable-image/generate/sd3", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
        ...formData.getHeaders()  // This includes the correct Content-Type header with boundary
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response from Stability AI API:", errorText);
      return res.status(response.status).json({ error: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error in /api/generate-waifu:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
