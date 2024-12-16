// index.js
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SUPPORTED_LANGUAGES = {
  id: "Indonesian",
  en: "English",
  zh: "Chinese",
  ja: "Japanese",
  ko: "Korean",
};

async function translateWithOpenAI(text, targetLang) {
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
    max_tokens: 1000,
  });

  return response.choices[0].message.content.trim();
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

async function translateSingleLanguage(
  text,
  targetLang,
  preferredService = "openai",
) {
  try {
    if (preferredService === "openai") {
      try {
        const result = await translateWithOpenAI(text, targetLang);
        return { lang: targetLang, text: result, service: "openai" };
      } catch (error) {
        console.log(`OpenAI failed for ${targetLang}, trying Gemini`);
        const result = await translateWithGemini(text, targetLang);
        return { lang: targetLang, text: result, service: "gemini" };
      }
    } else {
      try {
        const result = await translateWithGemini(text, targetLang);
        return { lang: targetLang, text: result, service: "gemini" };
      } catch (error) {
        console.log(`Gemini failed for ${targetLang}, trying OpenAI`);
        const result = await translateWithOpenAI(text, targetLang);
        return { lang: targetLang, text: result, service: "openai" };
      }
    }
  } catch (error) {
    console.error(`Failed to translate to ${targetLang}:`, error);
    return { lang: targetLang, error: error.message };
  }
}

async function translateToAllLanguages(text, preferredService = "openai") {
  // Filter out Indonesian (source language)
  const targetLanguages = Object.keys(SUPPORTED_LANGUAGES).filter(
    (lang) => lang !== "id",
  );

  try {
    console.log(
      `Starting translation to ${targetLanguages.length} languages...`,
    );

    // Translate to all languages concurrently
    const translations = await Promise.all(
      targetLanguages.map((lang) =>
        translateSingleLanguage(text, lang, preferredService),
      ),
    );

    // Format results
    const results = {
      original: { lang: "id", text },
      translations: {},
      stats: {
        successful: 0,
        failed: 0,
        openaiCount: 0,
        geminiCount: 0,
      },
    };

    translations.forEach((result) => {
      if (result.error) {
        results.translations[result.lang] = { error: result.error };
        results.stats.failed++;
      } else {
        results.translations[result.lang] = {
          text: result.text,
          service: result.service,
        };
        results.stats.successful++;
        if (result.service === "openai") results.stats.openaiCount++;
        if (result.service === "gemini") results.stats.geminiCount++;
      }
    });

    return results;
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to complete translations");
  }
}

// Test the translation
const main = async () => {
  try {
    const text =
      "Saya sangat senang belajar pemrograman dan teknologi artificial intelligence.";
    console.log("Original text:", text);
    console.log("\nTranslating...\n");

    const results = await translateToAllLanguages(text);

    console.log("\nTranslation Results:");
    console.log("-------------------");
    console.log("Original:", results.original.text);

    Object.entries(results.translations).forEach(([lang, translation]) => {
      console.log(`\n${SUPPORTED_LANGUAGES[lang]}:`);
      if (translation.error) {
        console.log(`Failed: ${translation.error}`);
      } else {
        console.log(`Text: ${translation.text}`);
        console.log(`Service: ${translation.service}`);
      }
    });

    console.log("\nStatistics:");
    console.log("-------------------");
    console.log(`Successful: ${results.stats.successful}`);
    console.log(`Failed: ${results.stats.failed}`);
    console.log(`OpenAI used: ${results.stats.openaiCount}`);
    console.log(`Gemini used: ${results.stats.geminiCount}`);
  } catch (error) {
    console.error("Error:", error.message);
  }
};

main();
