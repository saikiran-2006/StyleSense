# StyleSense Backend

Express API that powers the StyleSense AI Fashion Stylist frontend using
Google Gemini's vision model (`gemini-1.5-flash`).

## 1. Install

```bash
cd stylesense-backend
npm install
```

## 2. Get an API key

1. Go to https://aistudio.google.com/app/apikey
2. Create a free API key
3. Copy `.env.example` to `.env` and paste your key:

```bash
cp .env.example .env
```

```
GEMINI_API_KEY=paste_your_key_here
```

## 3. Run

```bash
npm start
```

You should see:

```
StyleSense backend running on http://localhost:5000
```

## 4. Connect the frontend

Replace your existing `analyze.js` with `analyze-updated.js` (rename it to
`analyze.js`), and keep `analyze.html`'s script tag pointing at it. It calls
`http://localhost:5000/api` by default — change `API_BASE_URL` at the top of
the file if you deploy the backend elsewhere.

Open `analyze.html` normally in a browser (or via a Live Server extension —
either works, since CORS is open in `.env.example`).

## API

### `POST /api/analyze`

`multipart/form-data`:
- `image` (file, required)
- `occasion`, `style`, `budget`, `colour`, `brand` (strings)

Returns JSON:
```json
{
  "skinTone": "...",
  "faceShape": "...",
  "colourExplanation": "...",
  "recommendedColours": [{ "name": "...", "hex": "#..." }],
  "outfit": { "topWear": "...", "bottomWear": "...", "shoes": "...", "watch": "...", "accessories": "..." },
  "estimatedBudget": 4500,
  "products": [{ "name": "...", "category": "...", "estimatedPrice": 1200, "brandStyle": "..." }],
  "reasonBox": "..."
}
```

### `POST /api/chat`

JSON body: `{ "message": "...", "analysisContext": <the object above>, "history": [{ "role": "user"|"assistant", "content": "..." }] }`

Returns: `{ "reply": "..." }`

## Notes

- **Products aren't linked to real retailers.** Gemini generates realistic
  product names/prices/styles, not live shopping links. To pull real
  products, swap that part of the prompt for a call to a shopping API (e.g.
  SerpApi's Google Shopping endpoint, or a retailer's own API) and merge the
  results before responding.
- **Swap to OpenAI instead of Gemini:** if you'd rather use GPT-4o/GPT-4o-mini,
  replace the `@google/generative-ai` calls in `routes/analyze.js` with the
  `openai` SDK's vision-capable chat completions — the JSON prompt in
  `utils/prompt.js` works the same way for both.
- **Deploying:** any Node host works (Render, Railway, Fly.io, a VPS). Just
  set `GEMINI_API_KEY` and `CORS_ORIGIN` (your frontend's real domain) as
  environment variables there instead of `.env`.
