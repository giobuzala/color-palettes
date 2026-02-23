# color palette helper

A tool for creating nice, percerptually correct and colorblind-safe color palettes, made with [chroma.js](https://github.com/gka/chroma.js) and [svelte](https://svelte.dev).

### live version at [vis4.net/palettes](https://vis4.net/palettes)

## AI chatbot key setup

To preconfigure your OpenAI key for the local chatbot:

1. Copy `.env.example` to `.env`
2. Set:

`OPENAI_API_KEY=your_key_here`

3. Start the app with `npm run dev`

You can still set/override the key in the chatbot settings panel; the locally saved key takes precedence over `.env`.
