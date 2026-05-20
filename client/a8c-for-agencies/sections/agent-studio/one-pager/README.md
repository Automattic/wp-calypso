# Agent Studio one-pager engine

Ports the radical-speed-month prototype's "Ela" pipeline into A4A so the June agent can generate real PDF one-pagers.

## Architecture

Everything in this directory is self-contained. The engine has no dependencies on Calypso state, Redux, or React — it talks to the outside world only through `services/`.

```
one-pager/
  engine/        Pure logic (prompt, CSS, layouts, paginator, renderers).
  brand-packs/   Brand definitions (tokens, fonts, logo). Built-in data only.
  services/     ⇢ THE SWAPPABLE BOUNDARY. Replace any service here. ⇠
  react/         Thin React hooks and UI used by the brief form and viewer.
```

## Swapping a service — start here

Every external dependency the engine touches goes through `services/`. To replace one (e.g. swap browser-side OpenAI for a wpcom proxy), import its interface from `services/types.ts`, write a new implementation, and register it once at app bootstrap:

```ts
// e.g. in client/a8c-for-agencies/index.ts or a section bootstrap:
import { setOnePagerServices } from 'calypso/a8c-for-agencies/sections/agent-studio/one-pager/services';
import { wpcomLLMService } from './my-wpcom-llm-service';

setOnePagerServices( { llm: wpcomLLMService } );
```

Anything not overridden keeps using the default. The engine never sees the change.

### The six services

| Service | Interface | Default impl | What a server impl would do |
|---|---|---|---|
| **`llm`** | `LLMService.chat( { model, messages, responseFormat?, signal? } )` | OpenAI Chat Completions from the browser, reads `.env` (`services/llm-service.ts`) | Hit `/wpcom/v2/ai/agent` via `packages/agents-manager`, with a pre-registered agent id |
| **`pdf`** | `PdfService.exportPdf( { title, pages } )` → `{ blob, fileName }` | Client-side jsPDF stitching PNGs (`services/pdf-service.ts`) | Server Puppeteer / headless Chrome render |
| **`thumbnail`** | `ThumbnailService.renderPagePng( { html, width, height } )` → data URL | html-to-image (`services/thumbnail-service.ts`) | Server PNG render returning a URL |
| **`brandPack`** | `BrandPackService.listPacks() / getPack( slug )` | In-bundle `BRAND_PACKS` registry (`services/brand-pack-service.ts`) | Fetch user-authored packs from wpcom |
| **`storage`** | `StorageService.saveGenerationResult / markGenerationFailed` | Wraps `agentStudioService.updateOutput` (IDB mock) (`services/storage-service.ts`) | Wpcom endpoint that owns deliverable persistence |
| **`telemetry`** | `TelemetryService.track*` | No-op (`services/telemetry-service.ts`); the React hooks dispatch Tracks directly | Optional — most installs use the no-op since React already dispatches Tracks |

The interfaces are intentionally small. If you need to add a method, edit `services/types.ts` and every impl will tell you what's missing at the type level.

## Local development with the default LLM service

The default `LLMService` calls `api.openai.com` directly. Provide a key via the repo-root `.env`, which Calypso's `dotenv-webpack` bakes into the bundle at build time:

```
A4A_OPENAI_API_KEY=sk-...
A4A_LLM_MODEL=gpt-5.4-mini
A4A_LLM_INPUT_PRICE=0.75
A4A_LLM_OUTPUT_PRICE=4.50
```

`.env` is gitignored. Restart `yarn start` after changing it. The pricing env vars only affect the cost number we log alongside the output — the model name is what drives the actual API call.

## What's in v1 vs deferred

**Shipping in v1:**
- Full engine (prompt + CSS + 22 layouts + cover composer + renderer).
- Single neutral brand pack (A4A blue accent).
- IndexedDB-backed mock storage so renders + image data URLs don't blow localStorage.
- One-pager card thumbnails (cover + first 3 body pages).
- PDF download via jsPDF.
- Cover variant picker + single / facing page viewer.

**Deferred:**
- LLM repair loop (coverage + additions check + re-call).
- Paginator for body overflow across pages.
- Multiple brand packs (WPCom, VIP, Woo).
- Server-side LLM, server PDF, server brand pack registry.
- Remix flow (the input snapshot is persisted, the UI button isn't).
