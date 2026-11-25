# Web development guide

This repository contains the client-side React app. Trace changes from the user action through the screen, API client, and server response. Chat is the main entry point. Discover also supports direct catalog searches.

## Code ownership

Keep the shell and navigation in `src/app`, product screens under `src/features` (chat, discovery, assets, contributions, and library), shared cards and controls in `src/components`, and transport code in `src/api`. Reuse components across screens. Maintain the session with the API cookie and use server responses for balances, prices, download rights, and operation outcomes. Storage credentials, MCP calls, and model access belong on the server.

## Compatibility and verification

Keep request fields, card IDs, WebSocket event order, and paid-operation keys compatible with the server. Test older responses and saved conversations with optional fields missing. Unknown events must allow processing of subsequent recognized events. Coordinate required wire changes with the server rollout. Reconnect during a turn and verify that the message is sent once, the card order survives, and acquisition rights are preserved.

For voice changes, exercise the opening screen and an existing chat. Check microphone permission, cancellation, automatic submission on Send, and draft recovery after failure. Show agent progress from actual service events. Test keyboard access and reduced motion.

## Observability

When changing retries, search, acquisition, or download, verify that API events and Grafana counters are counted once. Coordinate new measurements with the server's Prometheus metrics and panels. If Sentry is enabled, include screen and operation context. Exclude raw audio, prompts, images, and cookies from error reports. Local operation must support an empty DSN.

## Delivery and release notes

Install from the lockfile with `npm ci`, run `npm run build`, and test the changed action in a browser connected to the local API. For a card action, open the same asset from Chat and Discover and check balance and download rights after the first acquisition.

Record user-visible, integration, migration, and operational changes under **Unreleased** in [CHANGELOG.md](CHANGELOG.md) in the same change set. Describe who is affected, what they will observe, and any migration steps. For cross-repository work, record each repository's impact separately. Group delivered entries under the actual version and date when releasing.
