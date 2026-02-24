# [Color Den](https://colorden.vercel.app/)

A Svelte color-scale builder for perceptually balanced, colorblind-aware palettes,
forked from Gregor Aisch’s original tool and extended with an AI assistant to guide idea generation and creative exploration.

## Fork notice

This project is a **fork** of [`gka/palettes`](https://github.com/gka/palettes),
extended with an "Ask AI" flow.

## Overview

Original app:
- Build **sequential** and **diverging** palettes from custom color stops
- Tune scales with **bezier interpolation** and **lightness correction**
- Check and simulate colorblind variants (**deuteranopia/protanopia/tritanopia**)
- Export generated palettes in multiple copy-friendly formats

AI-enhanced app:
- Use **Ask AI** to translate natural language into palette settings

## Access

Color Den is deployed on [Vercel](https://vercel.com/). Use it at https://colorden.vercel.app/. Best experienced on desktop or tablet.

The original app is available at https://vis4.net/palettes.

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and set:

```bash
OPENAI_API_KEY=your_key_here
```

3. Start local development:

```bash
npm run dev
```

"Ask AI" calls `/api/chat`, and `server.js` forwards to OpenAI using your server-side key.

## Project structure

```text
Color Palettes/
├── src/
│   ├── App.svelte                # Main app screen + top-level state
│   ├── main.js                   # Svelte entrypoint
│   ├── AIChatbot.svelte          # AI chatbot panel and prompt flow
│   ├── ButtonGroup.svelte        # Segmented control UI
│   ├── Card.svelte               # Step section shell/card
│   ├── Checkbox.svelte           # Reusable checkbox control
│   ├── Color.svelte              # Single color chip + picker popover
│   ├── ColorBlindCheck.svelte    # Safety check + simulation selector
│   ├── ColorList.svelte          # Editable/draggable list of colors
│   ├── Export.svelte             # Palette export snippets
│   ├── InputColors.svelte        # Sequential/diverging input columns
│   ├── PalettePreview.svelte     # Generated palette preview
│   ├── StepChart.svelte          # L/C/H charts
│   └── colorBlind.js             # Colorblind simulation/safety logic
├── api/
│   └── chat.js                   # Production serverless OpenAI proxy
├── docs/
│   ├── index.html                # Static app host page
│   ├── bundle.js                 # Built JS bundle
│   ├── bundle.css                # Built CSS bundle
│   └── public/favicon.svg        # Favicon used by index.html
├── server.js                     # Local dev server + /api/chat
├── rollup.config.js              # Build config
├── package.json
└── README.md
```
