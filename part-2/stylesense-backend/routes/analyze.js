const express = require("express");
const multer = require("multer");
const { GoogleGenAI } = require("@google/genai");

const {
  buildAnalysisPrompt,
  buildChatPrompt,
} = require("../utils/prompt");

const router = express.Router();

// ======================================================
// MULTER
// ======================================================

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

// ======================================================
// GEMINI
// ======================================================

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,

  httpOptions: {
    timeout: 300000,
  },
});

const MODEL = "gemini-3.7-flash";

// ======================================================
// HELPERS
// ======================================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTemporaryGeminiError(err) {
  const message = String(
    err?.message || err || ""
  ).toLowerCase();

  return (
    message.includes("503") ||
    message.includes("unavailable") ||
    message.includes("high demand") ||
    message.includes("overloaded") ||
    message.includes("temporarily") ||
    message.includes("429") ||
    message.includes("resource exhausted")
  );
}

// ======================================================
// GEMINI REQUEST WITH RETRY
// ======================================================

async function generateWithRetry(
  request,
  retries = 3
) {
  let lastError;

  for (
    let attempt = 1;
    attempt <= retries;
    attempt++
  ) {
    try {
      console.log(
        `Gemini request attempt ${attempt}/${retries}`
      );

      const result =
        await genAI.models.generateContent({
          ...request,
          model: MODEL,
        });

      return result;
    } catch (err) {
      lastError = err;

      console.error(
        `Gemini attempt ${attempt} failed:`,
        err?.message || err
      );

      if (
        !isTemporaryGeminiError(err) ||
        attempt === retries
      ) {
        throw err;
      }

      const delay = attempt * 1500;

      console.log(
        `Retrying Gemini in ${delay}ms...`
      );

      await sleep(delay);
    }
  }

  throw lastError;
}

// ======================================================
// GET GEMINI RESPONSE TEXT
// ======================================================

function getResponseText(result) {
  if (!result) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  if (typeof result.text === "string") {
    return result.text;
  }

  if (typeof result.text === "function") {
    return result.text();
  }

  const candidates = result.candidates;

  if (
    candidates &&
    candidates[0] &&
    candidates[0].content &&
    candidates[0].content.parts
  ) {
    return candidates[0].content.parts
      .filter((part) => part.text)
      .map((part) => part.text)
      .join("");
  }

  throw new Error(
    "Gemini returned no text."
  );
}

// ======================================================
// SAFE JSON PARSER
// ======================================================

function safeParseJson(text) {
  if (
    !text ||
    typeof text !== "string"
  ) {
    throw new Error(
      "Empty Gemini response."
    );
  }

  let cleaned = text.trim();

  cleaned = cleaned
    .replace(
      /^```json\s*/i,
      ""
    )
    .replace(
      /^```\s*/i,
      ""
    )
    .replace(
      /\s*```$/i,
      ""
    )
    .trim();

  return JSON.parse(cleaned);
}

// ======================================================
// SERPAPI PRODUCT SEARCH
// ======================================================

async function searchProducts(products) {

  if (!process.env.SERPAPI_KEY) {

    console.warn(
      "SERPAPI_KEY is missing."
    );

    return [];
  }

  const results = [];

  for (
    const product of products || []
  ) {

    try {

      if (!product.searchQuery) {

        console.warn(
          "Product has no searchQuery:",
          product.name
        );

        continue;
      }

      console.log(
        `Searching Google Shopping for: ${product.searchQuery}`
      );

      const params =
        new URLSearchParams({

          engine:
            "google_shopping",

          q:
            product.searchQuery,

          location:
            "India",

          hl:
            "en",

          gl:
            "in",

          api_key:
            process.env.SERPAPI_KEY,
        });

      const response =
        await fetch(
          `https://serpapi.com/search.json?${params.toString()}`
        );

      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          `SerpAPI request failed (${response.status}): ${errorText}`
        );
      }

      const data =
        await response.json();

      if (data.error) {

        throw new Error(
          `SerpAPI error: ${data.error}`
        );
      }

      const shoppingResults =
        Array.isArray(
          data.shopping_results
        )
          ? data.shopping_results
          : [];

      const matches =
        shoppingResults

          .filter((item) => {

            const price =
              Number(
                item.extracted_price
              );

            return (
              item.title &&
              item.thumbnail &&
              (
                item.product_link ||
                item.link
              ) &&
              Number.isFinite(price) &&
              price > 0
            );
          })

          .slice(0, 2)

          .map((item) => ({

            name:
              item.title,

            category:
              product.category || "",

            brandStyle:
              item.source ||
              product.brandStyle ||
              "",

            estimatedPrice:
              Math.round(
                Number(
                  item.extracted_price
                )
              ),

            imageUrl:
              item.thumbnail,

            productUrl:
              item.product_link ||
              item.link,

            store:
              item.source ||
              "Online Store",
          }));

      results.push(
        ...matches
      );

    } catch (error) {

      console.error(
        `Product search failed for "${product.searchQuery}":`,
        error.message
      );
    }
  }

  // ====================================================
  // REMOVE DUPLICATES
  // ====================================================

  const unique = [];

  const seen =
    new Set();

  for (
    const product of results
  ) {

    if (
      !product.productUrl
    ) {
      continue;
    }

    if (
      seen.has(
        product.productUrl
      )
    ) {
      continue;
    }

    seen.add(
      product.productUrl
    );

    unique.push(
      product
    );
  }

  return unique.slice(
    0,
    8
  );
}

// ======================================================
// POST /api/analyze
// ======================================================

router.post(
  "/analyze",
  upload.single("image"),

  async (req, res) => {

    try {

      // ==================================================
      // CHECK IMAGE
      // ==================================================

      if (!req.file) {

        return res.status(400).json({
          error:
            "No image uploaded.",
        });
      }

      // ==================================================
      // USER DATA
      // ==================================================

      const {
        occasion = "",
        style = "",
        budget = "",
        colour = "",
        brand = "",
      } = req.body;

      console.log(
        "Starting fashion analysis..."
      );

      console.log({
        occasion,
        style,
        budget,
        colour,
        brand,
      });

      // ==================================================
      // BUILD GEMINI PROMPT
      // ==================================================

      const prompt =
        buildAnalysisPrompt({
          occasion,
          style,
          budget,
          colour,
          brand,
        });

      // ==================================================
      // IMAGE
      // ==================================================

      const imagePart = {

        inlineData: {

          data:
            req.file.buffer.toString(
              "base64"
            ),

          mimeType:
            req.file.mimetype,
        },
      };

      // ==================================================
      // GEMINI
      // ==================================================

      const result =
        await generateWithRetry({

          contents: [

            {

              role: "user",

              parts: [

                {
                  text: prompt,
                },

                imagePart,

              ],
            },

          ],

          config: {

            thinkingConfig: {
              thinkingLevel: "low",
            },

            maxOutputTokens:
              2500,

            responseMimeType:
              "application/json",
          },

        });

      // ==================================================
      // GET TEXT
      // ==================================================

      const text =
        getResponseText(
          result
        );

      console.log(
        "Gemini analysis response received."
      );

      // ==================================================
      // PARSE JSON
      // ==================================================

      let data;

      try {

        data =
          safeParseJson(
            text
          );

      } catch (parseError) {

        console.error(
          "Gemini returned invalid JSON:"
        );

        console.error(
          text
        );

        return res.status(502).json({

          error:
            "AI returned an unexpected format. Please try again.",

        });
      }

      // ==================================================
      // SEARCH REAL PRODUCTS
      // ==================================================

      console.log(
        "Searching for real products..."
      );

      const realProducts =
        await searchProducts(
          data.products
        );

      data.products =
        realProducts;

      console.log(
        `Real products found: ${realProducts.length}`
      );

      // ==================================================
      // RETURN RESULT
      // ==================================================

      return res.json(
        data
      );

    } catch (err) {

      console.error(
        "Analyze error:",
        err
      );

      if (
        isTemporaryGeminiError(
          err
        )
      ) {

        return res.status(503).json({

          error:
            "Gemini is temporarily busy. Please try again in a few seconds.",

        });
      }

      return res.status(500).json({

        error:
          err?.message ||
          "Analysis failed. Please try again.",

      });
    }
  }
);

// ======================================================
// POST /api/chat
// ======================================================

router.post(
  "/chat",
  express.json(),

  async (req, res) => {

    try {

      const {
        message,
        analysisContext,
        history,
      } = req.body;

      // ==================================================
      // VALIDATE
      // ==================================================

      if (
        !message ||
        !message.trim()
      ) {

        return res.status(400).json({

          error:
            "Message is required.",

        });
      }

      // ==================================================
      // BUILD PROMPT
      // ==================================================

      const prompt =
        buildChatPrompt({

          analysisContext:
            analysisContext ||
            {},

          history:
            Array.isArray(history)
              ? history
              : [],

          message:
            message.trim(),

        });

      console.log(
        "Sending chat request to Gemini..."
      );

      // ==================================================
      // GEMINI CHAT
      // ==================================================

      const result =
        await generateWithRetry({

          contents: [

            {

              role: "user",

              parts: [

                {
                  text: prompt,
                },

              ],

            },

          ],

          config: {

            maxOutputTokens:
              1000,

          },

        });

      // ==================================================
      // RESPONSE
      // ==================================================

      const reply =
        getResponseText(
          result
        ).trim();

      if (!reply) {

        return res.status(502).json({

          error:
            "AI returned an empty response.",

        });
      }

      console.log(
        "Chat response received."
      );

      return res.json({

        reply,

      });

    } catch (err) {

      console.error(
        "Chat error:",
        err
      );

      if (
        isTemporaryGeminiError(
          err
        )
      ) {

        return res.status(503).json({

          error:
            "Gemini is temporarily busy. Please try again in a few seconds.",

        });
      }

      return res.status(500).json({

        error:
          err?.message ||
          "Chat failed. Please try again.",

      });
    }
  }
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;