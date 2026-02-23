# chroma.js palette ai copilot

A Svelte app for building perceptually-tuned, colorblind-aware palettes with
[`chroma.js`](https://github.com/gka/chroma.js).

## Fork notice

This project is a **fork** of Gregor Aisch’s palette helper (original project:
[`gka/palettes`](https://github.com/gka/palettes)), **extended by Giorgi Buzaladze**
([`giobuzala.com`](https://giobuzala.com/)) with an added AI layer (“Ask AI”) and UI tweaks.

## Features

- **Sequential & diverging** palettes
- **Bezier interpolation** and **lightness correction**
- **Colorblind checks** + simulation (deuteranopia / protanopia / tritanopia)
- **Export** in a few common copy/paste formats
- **Ask AI**: converts a plain-English request into palette settings

## Development

```bash
npm install
npm run dev
```

The app is served from `docs/` (handy for GitHub Pages-style hosting). To build:

```bash
npm run build
```

## “Ask AI” key setup (local)

1. Copy `.env.example` to `.env`
2. Set:

```bash
OPENAI_API_KEY=your_key_here
```

3. Run `npm run dev`

### Security note

The current setup injects the API key into the client bundle at build time. That’s fine for
**local experiments**, but you should **not** ship a real key in a public deployment. For a
production-ready setup, route requests through a small backend/proxy that keeps the key secret.
