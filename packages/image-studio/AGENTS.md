# Image Studio

AI-powered image editing/generation for WordPress. Two modes: **Edit** and **Generate**.

## Critical Patterns (Don't Break These)

- **Single store**: All state in `src/store/index.ts`. Do NOT create separate store files.
- **Non-serializable store values**: `onCloseCallback` and `annotationCanvasRef` are intentionally non-serializable in the Redux store for cross-bundle communication. Don't "fix" this.
- **Checkpoint system**: `lastSavedAttachmentId` tracks the user's last explicit save. On exit, this determines which image to apply.
- **Draft cleanup**: Temporary images tracked in `draftIds`. On exit, drafts are deleted except originals and saved images. Never delete the original attachment. See `use-draft-cleanup.ts`.
- **Abilities API**: Changes to `update-canvas-image` affect the AI agent contract. Coordinate with backend team.
- **Cross-bundle**: Image Studio runs in a separate bundle from the block editor. The store is the bridge. Don't assume direct component access.

## Conventions (Non-Obvious)

- **Prefer hooks over components** for feature logic. Keep components as thin renderers. Simple prop transformations are fine in components.
- **Tracking prefix**: All analytics events auto-prefixed with `jetpack_big_sky_`. Use `recordEvent()` from `src/utils/tracking.ts`.
- **Styling**: Use design tokens from `src/components/styles/_variables.scss`.
- **Prefer `@wordpress/components`** for standard UI (Button, Modal) over custom primitives, except for highly custom interactions (annotation canvas).
- **Types**: Shared types in `src/types/index.ts`. Use enums for fixed option sets.

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

All commands work from `packages/image-studio/`:

```bash
yarn build       # TypeScript compile (ESM + CJS)
yarn test        # Unit tests
yarn lint        # ESLint
yarn typecheck   # Type check (dry run)
```

**Always run full validation** (`yarn build && yarn test && yarn lint && yarn typecheck`) before submitting. All must pass with zero errors. Test files go alongside source: `use-foo.ts` → `use-foo.test.ts`.

## UI Testing

Refer to comprehensive UI tests in [packages/image-studio/.agents/skills/ui-testing/SKILL.md](packages/image-studio/.agents/skills/ui-testing/SKILL.md)

## PR Guidelines

- Reference Linear issue ID in title
- Before/after screenshots for UI changes
- Test in both Edit and Generate modes for shared components

---

## Self-Rating

After completing any task in this package, evaluate this file:

- If a section prevented a mistake, bump the rating up.
- If you made a mistake this file should have caught, add the missing guidance above and bump the rating up.
- If something here is wrong or stale, fix it and bump the rating down.

**Rating: 7/10** | **Last updated**: 2026-03-01

**7/10 justification**: Added error handling patterns, entry point behavior guidance, cross-bundle debugging tips, and contextual qualifiers to conventions. Trimmed over-specified styling/i18n details.
