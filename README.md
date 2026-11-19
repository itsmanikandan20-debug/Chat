# Best Designer in 2030 · Manikandan

A chat-style portfolio page. A visitor asks two fixed questions, then the chat unlocks:
they can ask anything about Manikandan (answered by Google Gemini) or order from an emoji menu.

## Files

- `index.html` – the whole page (design, animations, emoji ordering)
- `api/chat.js` – a Vercel serverless function that calls Gemini. Your API key stays on the server.

## Deploy on Vercel

1. Get a Gemini API key at https://aistudio.google.com/apikey
2. Go to https://vercel.com/new and import this GitHub repo. No build settings are needed.
3. Before deploying, open **Environment Variables** and add:
   - `GEMINI_API_KEY` = your key
   - (optional) `GEMINI_MODEL` = a model name, default `gemini-3.5-flash-lite`
   - (optional) `ALLOWED_ORIGIN` = your site address, e.g. `https://chat-xyz.vercel.app`
4. Click **Deploy**. Every push to `main` redeploys automatically.

If the key is missing, the page still works; the AI part shows a friendly "can't reach the AI" message.
