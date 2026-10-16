const { GoogleGenerativeAI } = require("@google/generative-ai");

const FALLBACK_MODEL = "gemini-3.6-flash";

const resolveGeminiModel = (rawModel) => {
  const normalized = (rawModel || "").trim().toLowerCase();

  if (!normalized) return FALLBACK_MODEL;
  if (normalized === "gemini-3.8-flash" || normalized === "gemini-3.8") return FALLBACK_MODEL;

  return normalized.startsWith("gemini-") ? normalized : FALLBACK_MODEL;
};

const apiKey = process.env.GEMINI_API_KEY?.trim();
const configuredModel = resolveGeminiModel(process.env.GEMINI_MODEL);

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not configured. AI endpoints will fail until it is set.");
}

if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL !== configuredModel) {
  console.warn(`GEMINI_MODEL was set to an unsupported value, using ${configuredModel} instead.`);
}

if (process.env.GEMINI_MODEL && process.env.GEMINI_MODEL.toLowerCase().includes("3.8")) {
  console.warn("The gemini-3.8-flash model is unavailable in the current Gemini API; switched to gemini-3.6-flash.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: configuredModel }) : null;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const askGemini = async (prompt, retries = 3) => {
  if (!apiKey || !model) {
    throw new Error("GEMINI_API_KEY is missing or invalid. Set it in the environment before using AI features.");
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      lastError = error;
      const message = error?.message || "Unknown Gemini API error";

      if (/model.*not found|no longer available|not supported|gemini-3\.8|gemini-3\.8-flash/i.test(message)) {
        throw new Error(`Gemini model configuration is invalid. Use ${FALLBACK_MODEL} or another supported Gemini model.`);
      }

      if (attempt < retries && /429|503|temporar|high demand|rate limit|timeout|fetch/i.test(message)) {
        await wait(1000 * (attempt + 1));
        continue;
      }

      throw new Error(`Gemini request failed: ${message}`);
    }
  }

  throw new Error(`Gemini request failed: ${lastError?.message || "Unknown Gemini API error"}`);
};

module.exports = { askGemini, resolveGeminiModel };
