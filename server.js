// server.js
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SUPPORTED_LANGUAGES = {
  id: "Indonesian",
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

async function translateBerita(text, targetLang) {
  const prompt = `Translate this Indonesian text to ${SUPPORTED_LANGUAGES[targetLang]}: "${text}"
  Provide only the direct translation without any additional text or explanations.`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a professional translator. Provide direct translations without explanations.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
}

async function translateWithGemini(text, targetLang) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Translate this Indonesian text to ${SUPPORTED_LANGUAGES[targetLang]}: "${text}"
  Provide only the direct translation without any additional text or explanations.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

app.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res
        .status(400)
        .json({ error: "Text and target language are required" });
    }

    const languages = targetLang.split(",").map((lang) => lang.trim());
    const translations = {};

    for (const lang of languages) {
      if (!SUPPORTED_LANGUAGES[lang]) {
        translations[lang] = `Error: Unsupported language ${lang}`;
        continue;
      }

      try {
        // Try Gemini first
        translations[lang] = await translateWithGemini(text, lang);
      } catch (error) {
        try {
          // Fallback to OpenAI if Gemini fails
          translations[lang] = await translateBerita(text, lang);
        } catch (fallbackError) {
          translations[lang] = `Translation failed`;
        }
      }
    }

    res.json({
      original_text: text,
      translations,
    });
  } catch (error) {
    res.status(500).json({ error: "Translation service error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
