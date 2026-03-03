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

- **Hooks over components**: Feature logic goes in `src/hooks/`. Components should be thin renderers.
- **Tracking prefix**: All analytics events auto-prefixed with `jetpack_big_sky_`. Use `recordEvent()` from `src/utils/tracking.ts`.
- **Styling**: Dark theme SCSS. Tokens in `src/components/styles/_variables.scss`. Background: `#1e1e1e`, foreground: `#fff`.
- **Components**: Use `@wordpress/components` (Button, Modal, etc.) over custom primitives.
- **i18n**: All user-facing strings via `__()` or `_n()` from `@wordpress/i18n`.
- **Types**: Shared types in `src/types/index.ts`. Use enums for fixed option sets.

## Testing Commands

```bash
# Unit tests (run from repo root)
yarn jest packages/image-studio --config packages/image-studio/jest.config.js

# Type check
yarn workspace @automattic/image-studio tsc --build --dry
```

Run both before creating a PR. Test files go alongside source: `use-foo.ts` → `use-foo.test.ts`.

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

**Rating: 6/10** | **Last updated**: 2026-02-23
