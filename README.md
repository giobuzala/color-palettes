# chroma.js palette ai copilot

A Svelte app for building perceptually-tuned, colorblind-aware palettes with
[`chroma.js`](https://github.com/gka/chroma.js).

## Fork notice

This project is a **fork** of Gregor Aisch’s palette helper (original project: [`gka/palettes`](https://github.com/gka/palettes)), **extended by Giorgi Buzaladze** with an added AI layer.

## Features

- **Sequential & diverging** palettes
- **Bezier interpolation** and **lightness correction**
- **Colorblind checks** + simulation (deuteranopia / protanopia / tritanopia)
- **Export** in a few common copy/paste formats
- **Ask AI**: converts a plain-English request into palette settings

## Development

```bash
npm install
npm run build
```

**Local dev (with Ask AI):** The app calls `/api/chat` for the AI. Locally, run the dev server so the API is available:

```bash
npm run dev
```

This runs the Rollup watcher and a small Node server that serves `docs/` and proxies `/api/chat` to OpenAI using `OPENAI_API_KEY` from your `.env` file. Open http://localhost:5000.

- Add a `.env` file with `OPENAI_API_KEY=your_key` (see `.env.example`).
- **Static-only:** `npm run start` serves `docs/` with no API (Ask AI will show a server error until you use a host that provides the API).

## Deploy to Vercel

The API key is **never** in the frontend; chat goes through a serverless proxy. To deploy:

1. **Push your repo** to GitHub (e.g. `giobuzala/color-palettes`).

2. **Import on Vercel**
   - Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.
   - Import your GitHub repo. Leave **Build Command** and **Output Directory** as-is (they’re set in `vercel.json`: `npm run build`, `docs`).

3. **Set the API key**
   - In the project: **Settings** → **Environment Variables**.
   - Add: **Name** `OPENAI_API_KEY`, **Value** your OpenAI API key.
   - Apply to Production (and Preview if you want).

4. **Deploy**
   - Click **Deploy**. When the build finishes, open the project URL. Ask AI will work there.

To redeploy after changes, push to your default branch or trigger a deploy from the Vercel dashboard.

---

## Deploy elsewhere

**Other hosts**  
   - Deploy the `docs/` folder as the static site.
   - Run the `/api/chat` logic as a serverless function or backend that reads `OPENAI_API_KEY` from env and proxies to OpenAI (see `api/chat.js` and `server.js` for the expected request/response shape).
