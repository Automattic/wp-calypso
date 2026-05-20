# Agent Studio one-pager engine

Ports the radical-speed-month prototype's "Ela" pipeline into A4A so the June agent can generate real PDF one-pagers.

## Architecture

Everything in this directory is self-contained and depends on the rest of A4A only through the `services/` adapters.

- `engine/` — the LLM prompt, BASE_CSS, body / cover layouts, paginator, coverage repair, PNG renderer, PDF stitcher. Pure logic.
- `brand-packs/` — brand definitions (tokens, fonts, logo). The neutral pack ships with v1; user-authored packs will land via the `BrandPackService`.
- `services/` — swappable adapters. The engine never calls `fetch`, `localStorage`, or the DOM rasterizer directly — it goes through these interfaces. Server-side replacements (wpcom endpoint, server PDF) drop in here without touching the engine.
- `react/` — thin React hooks and UI shared by the brief form and the output detail page.

## Local development

The default `LLMService` calls the OpenAI Chat Completions API directly from the browser. Provide a key one of two ways:

1. **Build-time** — add to your repo-root `.env` (gitignored, picked up by Calypso's `dotenv-webpack`):

   ```
   A4A_OPENAI_API_KEY=sk-...
   A4A_LLM_MODEL=gpt-4o-mini
   ```

   Restart `yarn start` after changes for the new values to bake into the bundle.

2. **Runtime override** — the brief screen surfaces a "Set local key" link in non-production builds. The key is stored in `localStorage` under `a4a-agent-studio-one-pager-dev-key`. The runtime key always wins over the build-time key.

## Swapping in server-side services

Each service exposes a small interface. To wire a server impl, replace the default in `services/index.ts`:

```ts
import { setOnePagerServices } from './services';
import { wpcomLLMService } from './services/wpcom-llm-service';

setOnePagerServices( { llm: wpcomLLMService } );
```

Anything not overridden keeps using the defaults.
