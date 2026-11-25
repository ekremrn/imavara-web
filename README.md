# Imavara Web

Imavara's React and Vite client helps you find a stock photo or create one when the catalog has no suitable match. Start with a written description, record a voice message, or attach a reference image. The chat presents results as cards with previews, similarity scores, and an original-file download action. [Backend and architecture diagrams](https://github.com/ekremrn/imavara-server#architecture)

## Using the app

- **Chat** to search, generate a photo, or request a variation of a specific result. Reopen past conversations in the same browser.
- **Discover** lets you browse the shared catalog, search by text or reference image, and filter results. Click a preview to enlarge it or use its download button to get the original.
- **Library** holds the images you generated or acquired. A new browser session starts with 100 credits. Search and preview are free. First acquisition costs 1 credit, generation or variation costs 3, and downloading an acquired original again is free.

## Local setup

Start the backend with Docker Compose. The default API address is `http://127.0.0.1:18080`. [Server setup](https://github.com/ekremrn/imavara-server#local-setup)

From this repository, using Node.js 22.12 or later:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite. Its proxy forwards both HTTP requests under `/v1` and the chat WebSocket to the API, allowing the browser to use a single origin. Set `IMAVARA_API_URL` when starting Vite to select a different backend. Voice recording requires microphone permission and HTTPS or localhost.

To build and preview the production bundle locally:

```sh
npm run build
npm run preview
```

[Development guide](AGENTS.md) · [Changelog](CHANGELOG.md)
