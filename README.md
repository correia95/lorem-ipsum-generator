# Lorem Ipsum Generator

Placeholder text for mockups and layouts, generated in the browser.

- Units: **paragraphs**, **sentences**, **words**, or **list items** (1–200).
- Keep or drop the classic *"Lorem ipsum dolor sit amet…"* opening.
- Output as **plain text** or **HTML** (`<p>` / `<ul><li>`).
- Regenerate for fresh random text; word count and character count shown; one-click copy.
- Unit, count and opening-line setting persist in the URL.

## Develop

```
npm install
npm run dev
npm run build
```

Engine: [`src/lorem.ts`](src/lorem.ts) — classic lorem word bank, `crypto.getRandomValues` for
variety. Static site on Cloudflare Workers.

Part of [Tiny Tools](https://tinytools.correia95.workers.dev).
