# Image Studio

AI-powered image editing/generation for WordPress. Two modes: **Edit** and **Generate**.

## File Guide (Read the Right File)

| File                                                                     | Purpose                                                  | When to read                                             |
| ------------------------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------- |
| **AGENTS.md** (this file)                                                | Critical patterns, pitfalls, conventions                 | Always read first for any code change                    |
| [README.md](README.md)                                                   | Architecture, project structure, build/test/dev commands | When you need to understand how it works or run commands |
| [.agents/skills/ui-testing/SKILL.md](.agents/skills/ui-testing/SKILL.md) | Comprehensive UI test cases                              | Only when running UI tests                               |

## Critical Patterns (Don't Break These)

- **Single store**: All state in `src/store/index.ts`. Do NOT create separate store files.
- **Non-serializable store values**: `onCloseCallback` and `annotationCanvasRef` are intentionally non-serializable in the Redux store for cross-bundle communication. Don't "fix" this.
- **Checkpoint system**: `lastSavedAttachmentId` tracks the user's last explicit save. On exit, this determines which image to apply.
- **Draft cleanup**: Temporary images tracked in `draftIds`. On exit, drafts are deleted except originals and saved images. Never delete the original attachment. See `use-draft-cleanup.ts`.
- **Cross-bundle**: Image Studio runs in a separate bundle from the block editor. The store is the bridge. Don't assume direct component access.

## Abilities API (`src/abilities/`)

Changes to `update-canvas-image` affect the **AI agent contract** — this is how the backend tells Image Studio to refresh the canvas after saving an attachment. Coordinate with backend team before modifying.

- **Contract**: Backend calls `image-studio/update-canvas-image` with `{ attachmentId, url, metadata }`.
- **Registration**: Ability is registered once via `@wordpress/abilities`. The `isRegistered` guard prevents duplicates.
- **Flow**: Receives attachment ID → preloads image → resolves attachment via `core-data` → updates store (canvas metadata, draft tracking, mode transition).
- **0% test coverage** — changes here need manual sandbox testing at minimum.

## Extensions (`src/extensions/`)

Three HOCs that inject Image Studio into the block editor via `addFilter`. These run in the **block editor bundle**, not Image Studio's bundle.

| File                                  | What it does                                           | Filter hook               |
| ------------------------------------- | ------------------------------------------------------ | ------------------------- |
| `generate-button-extension.tsx`       | "Generate Image" button in Image block placeholder     | `editor.MediaPlaceholder` |
| `image-toolbar-extension.tsx`         | "Edit with AI" toolbar button on selected Image blocks | `editor.BlockEdit`        |
| `external-media-source-extension.tsx` | Image Studio as external media source                  | `editor.MediaPlaceholder` |

- The `utils.ts` helper converts Image Studio's `ImageData` to the shape `onSelect` expects.
- `any` types in these files are due to WordPress filter HOC signatures — no upstream types exist. If adding new extensions, follow the same pattern.

## Tracking (`src/utils/tracking.ts`)

576 lines, 28+ exported functions. **31% test coverage** — the biggest gap in the package.

- **All events auto-prefixed**: `jetpack_big_sky_` (Jetpack) or `wpcom_big_sky_` (WP.com) based on `detectPlatform()`.
- **Adding a new event**: Use `recordImageStudioEvent( name, properties )` — never call `recordTracksEvent` directly. The wrapper adds session ID, entry point, and platform prefix automatically.
- **Session tracking**: Every event includes `session_id` from `src/utils/session.ts`.
- **When adding features**: Check if a tracking function already exists before creating a new one. The file has granular helpers for most UI interactions (tool clicks, sidebar, generation, feedback, navigation, metadata).

## Client Context (`src/utils/client-context.ts`)

Builds the context object the AI agent receives. **0% test coverage.** This determines what the agent knows about the current state.

- Reads from Image Studio store (current image, mode, metadata) and block editor store (page content, selected blocks).
- `getPageContent()` walks the block tree to extract text content for contextual suggestions.
- Changes here directly affect AI generation quality — test on sandbox with both Media Library and Block Editor entry points.

## Type Guards (`src/types/guards.ts`)

306 lines of runtime validation at WordPress API boundaries. **0% test coverage.**

- Every `is*` function validates data from `@wordpress/core-data` or REST API responses before use.
- If you modify the types in `src/types/index.ts`, update the corresponding guard. A guard that doesn't match its type will silently reject valid data.

## Conventions (Non-Obvious)

- **Prefer hooks over components** for feature logic. Keep components as thin renderers.
- **Tracking**: See tracking section above. Use `recordImageStudioEvent()`, not the base function.
- **Styling**: Use design tokens from `src/components/styles/_variables.scss`.
- **Prefer `@wordpress/components`** for standard UI (Button, Modal) over custom primitives, except annotation canvas.
- **Types**: Shared types in `src/types/index.ts`. Use enums for fixed option sets. Runtime validation in `src/types/guards.ts`.
- **Tests must be TypeScript**: Use `.test.ts`/`.test.tsx`, not `.test.js`. (Two legacy `.test.js` files exist — don't add more.)

## Error Handling

- **Notices**: Use store `setError()` action + `use-image-studio-message-display.ts` hook to display user-facing errors.
- **Console logging**: Log errors to console for debugging. Store error state in `src/store/index.ts`.
- **API failures**: Hooks should handle failed API calls gracefully and dispatch error actions to store.

## Entry Points

Image Studio has multiple entry points defined in `ImageStudioEntryPoint` enum (`src/types/index.ts`). Each affects modal behavior and feature availability. See `src/index.tsx:openImageStudioModal()` for initialization logic per entry point.

## Debugging Cross-Bundle

- **Store inspection**: Image Studio runs in a separate bundle. Inspect store state via browser console when debugging.
- **Symptom**: Buttons render but modal doesn't open → check if store bridge is working.
- **Symptom**: Save dispatches but editor doesn't update → verify extension filter registrations in `src/extensions/`.

## Build & Test

See [README.md](README.md) for all commands. Quick reference:

```bash
yarn build && yarn test && yarn lint && yarn typecheck  # Full validation (run before submitting)
```

Test files go alongside source: `use-foo.ts` → `use-foo.test.ts`.

**Coverage gaps to be aware of** (test manually if modifying):

- `utils/tracking.ts` — 31% statements
- `abilities/update-canvas-image.ts` — 0%
- `utils/client-context.ts` — 0%
- `types/guards.ts` — 0%

## PR Guidelines

- Reference Linear issue ID in title
- Before/after screenshots for UI changes
- Test in both Edit and Generate modes for shared components

**Last updated**: 2026-03-02
