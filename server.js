const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:4200",
    credentials: true,
  })
);
app.use(express.json());

// Ollama configuration
const OLLAMA_CONFIG = {
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  model: process.env.OLLAMA_MODEL || "llama2",
  temperature: parseFloat(process.env.OLLAMA_TEMPERATURE) || 0.7,
  maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS) || 2048,
};

// Available languages for flirting practice
const SUPPORTED_LANGUAGES = {
  english: {
    name: "English",
    emoji: "🇺🇸",
    culture: "witty British charm with American confidence",
  },
  french: {
    name: "Français",
    emoji: "🇫🇷",
    culture: "sophisticated Parisian elegance and romantic passion",
  },
  german: {
    name: "Deutsch",
    emoji: "🇩🇪",
    culture: "direct yet charming German efficiency with playful humor",
  },
  hindi: {
    name: "हिंदी",
    emoji: "🇮🇳",
    culture: "warm Indian hospitality with poetic expressions",
  },
  italian: {
    name: "Italiano",
    emoji: "🇮🇹",
    culture: "passionate Italian romance with expressive gestures",
  },
  portuguese: {
    name: "Português",
    emoji: "🇧🇷",
    culture: "warm Brazilian friendliness with European sophistication",
  },
  spanish: {
    name: "Español",
    emoji: "🇪🇸",
    culture: "passionate Spanish flair with Latin American warmth",
  },
  thai: {
    name: "ไทย",
    emoji: "🇹🇭",
    culture: "gentle Thai politeness with subtle playful teasing",
  },
};

// Generate flirty system prompt based on language
const getFlirtySystemPrompt = (language = "english") => {
  const langInfo =
    SUPPORTED_LANGUAGES[language.toLowerCase()] ||
    SUPPORTED_LANGUAGES["english"];

  return `You are FlirtBot9000, a charming and playfully flirtatious AI assistant practicing flirting in ${langInfo.name} ${langInfo.emoji}.

🌍 Language & Culture:
- Respond ENTIRELY in ${langInfo.name}
- Embody ${langInfo.culture}
- Use culturally appropriate flirting styles for ${langInfo.name}
- Focus purely on flirting and fun conversation

🌟 Characteristics:
- Witty and clever with your responses
- Playfully teasing and occasionally cheeky
- Confident and charismatic
- Use subtle compliments and charming language
- Be engaging and make conversations fun
- Stay in character as a flirty conversation partner

💬 Communication Style:
- Use emojis occasionally to add personality 😉
- Include playful banter and clever comebacks
- Give compliments that feel genuine 
- Use words like "gorgeous," "charming," "delightful," "captivating" (in ${langInfo.name})
- Be mysterious and intriguing occasionally
- Keep responses engaging and conversational
- Keep responses concise and to the point
- Try to mirror the length of the user's messages
- Initially, play a bit hard to get, but warm up as the conversation progresses
- The user is an adult, so you can be cheeky and flirty

Remember: Pure flirting mode - be charming, engaging, and flirtatious in ${langInfo.name}!`;
};

// Get available languages
app.get("/api/languages", (req, res) => {
  res.json({
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([key, value]) => ({
      id: key,
      name: value.name,
      emoji: value.emoji,
      culture: value.culture,
    })),
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    ollama: {
      baseURL: OLLAMA_CONFIG.baseURL,
      model: OLLAMA_CONFIG.model,
      status: "configured",
    },
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const {
      message,
      conversationHistory = [],
      stream = true,
      language = "english",
    } = req.body;

    if (!message || typeof message !== "string") {
      return res
        .status(400)
        .json({ error: "Message is required and must be a string" });
    }

    // Validate language
    const selectedLanguage = language.toLowerCase();
    if (!SUPPORTED_LANGUAGES[selectedLanguage]) {
      return res.status(400).json({
        error: "Unsupported language",
        supportedLanguages: Object.keys(SUPPORTED_LANGUAGES),
      });
    }

    // Get language-specific system prompt
    const systemPrompt = getFlirtySystemPrompt(selectedLanguage);

    // Prepare conversation context
    const conversationContext = conversationHistory
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join("\n");

    // Build the full prompt with system prompt
    let fullPrompt;
    if (conversationContext) {
      fullPrompt = `${systemPrompt}\n\n${conversationContext}\nUser: ${message}\nFlirtBot9000:`;
    } else {
      fullPrompt = `${systemPrompt}\n\nUser: ${message}\nFlirtBot9000:`;
    }

    if (stream) {
      // Streaming response for faster perceived performance
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      const ollamaResponse = await axios.post(
        `${OLLAMA_CONFIG.baseURL}/api/generate`,
        {
          model: OLLAMA_CONFIG.model,
          prompt: fullPrompt,
          stream: true,
          options: {
            temperature: OLLAMA_CONFIG.temperature,
            num_predict: OLLAMA_CONFIG.maxTokens,
          },
        },
        {
          responseType: "stream",
        }
      );

      ollamaResponse.data.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        lines.forEach((line) => {
          if (line.trim() && line.startsWith("{")) {
            try {
              const data = JSON.parse(line);
              if (data.response) {
                res.write(data.response);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        });
      });

      ollamaResponse.data.on("end", () => {
        res.end();
      });
    } else {
      // Non-streaming response (original behavior)
      const ollamaResponse = await axios.post(
        `${OLLAMA_CONFIG.baseURL}/api/generate`,
        {
          model: OLLAMA_CONFIG.model,
          prompt: fullPrompt,
          stream: false,
          options: {
            temperature: OLLAMA_CONFIG.temperature,
            num_predict: OLLAMA_CONFIG.maxTokens,
          },
        }
      );

      const response = ollamaResponse.data.response;

      res.json({
        message: response,
        timestamp: new Date().toISOString(),
        model: OLLAMA_CONFIG.model,
        conversationId: Date.now().toString(),
      });
    }
  } catch (error) {
    console.error("Error in chat endpoint:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        error:
          "Ollama service is not available. Please ensure Ollama is running.",
        details: "Connection refused to Ollama service",
      });
    }

    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
});

// Get available models from Ollama
app.get("/api/models", async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_CONFIG.baseURL}/api/tags`);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching models:", error);
    res.status(500).json({
      error: "Failed to fetch available models",
      details: error.message,
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FlirtBot9000 Backend running on port ${PORT}`);
  console.log(`📡 Ollama configured for model: ${OLLAMA_CONFIG.model}`);
  console.log(`🔗 Ollama URL: ${OLLAMA_CONFIG.baseURL}`);
  console.log(
    `🌐 CORS enabled for: ${process.env.CORS_ORIGIN || "http://localhost:4200"}`
  );
});

module.exports = app;
