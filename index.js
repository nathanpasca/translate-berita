import dotenv from "dotenv";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

// Konfigurasi OpenAI
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
  try {
    const prompt = `Translate the following Indonesian text to ${SUPPORTED_LANGUAGES[targetLang]}. 
    Maintain the original context, meaning, and formatting. 
    Only provide the translation without any additional explanations.
    
    Text to translate: ${text}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a professional translator with expertise in Indonesian, English, Chinese, Japanese, and Korean languages.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error(
      `Failed to translate text to ${SUPPORTED_LANGUAGES[targetLang]}`,
    );
  }
}

async function translateWithGemini(text, targetLang) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Translate the following Indonesian text to ${SUPPORTED_LANGUAGES[targetLang]}. 
  Maintain the original context, meaning, and formatting. 
  Only provide the translation without any additional explanations.
  
  Text to translate: ${text}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
// Test the translation
const main = async () => {
  try {
    const translatedText = await translateWithGemini(
      "saya adalah seorang yang hebat",
      "en,zh,ja,ko",
    );
    console.log("Translated text:", translatedText);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

main();
