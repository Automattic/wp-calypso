# Image Studio - AGENTS.md

## Package Overview

`@automattic/image-studio` is an AI-powered image editing and generation tool for WordPress. It provides two modes: **Edit** (modify existing images) and **Generate** (create new images from prompts).

## Architecture

### State Management

All state lives in the WordPress data store `image-studio` (`src/store/index.ts`). This store is the single source of truth for:

- Modal open/close state and current mode (Edit/Generate)
- Current and original image URLs and attachment IDs
- Draft management (temporary AI-generated images)
- Annotation state (brush/lasso drawing tools)
- Image metadata (title, caption, description, alt text)
- Navigation between media library images
- UI state (sidebar open, selected style, aspect ratio)

**Important patterns:**

- **Checkpoint system**: `lastSavedAttachmentId` tracks the user's last explicit save. On exit, this determines which image to apply.
- **Draft cleanup**: All temporary images are tracked in `draftIds`. On exit, drafts are deleted except the original and any saved images.
- **Non-serializable store values**: `onCloseCallback` and `annotationCanvasRef` are stored in the Redux store for cross-bundle communication despite not being serializable. This is intentional.

### Component Hierarchy

```
ImageStudio (src/components/index.tsx)
  -> Header (toolbar, save button, navigation)
  -> EditLayout / GenerateLayout (mode-specific containers)
     -> Canvas (image display + annotation overlay)
     -> CanvasControls (revision navigator)
  -> Sidebar (metadata editing, file details)
  -> Footer (agent chat UI via agenttic-client)
  -> ConfirmationDialog (unsaved changes)
```

### Abilities API

The package registers `image-studio/update-canvas-image` via the WordPress Abilities API (`src/abilities/`). This is how the AI agent pushes processed images back to the UI.

### Block Editor Integration

Extensions in `src/extensions/` register Gutenberg filters:

- Image block toolbar: "Edit with AI" button
- Image placeholder: "Generate" button
- External media modal: "Generate with AI" source

### Provider Exports

`src/provider/index.ts` exports `toolProvider` and `contextProvider` for `@automattic/agents-manager` integration.

## Key Files

| File                                   | Purpose                                 |
| -------------------------------------- | --------------------------------------- |
| `src/index.tsx`                        | Main entry point, initialization        |
| `src/store/index.ts`                   | Redux store (state, actions, selectors) |
| `src/components/index.tsx`             | Main ImageStudio modal component        |
| `src/abilities/update-canvas-image.ts` | AI agent -> UI image update             |
| `src/provider/index.ts`                | agents-manager integration              |
| `src/extensions/`                      | Block editor filters                    |
| `src/utils/tracking.ts`                | Analytics event helper                  |
| `src/utils/agent-config.ts`            | Agent setup and JWT auth                |
| `src/types/index.ts`                   | Core TypeScript types                   |

## File Organization

```
src/
├── index.tsx              # Entry point & initialization
├── store/                 # WordPress data store (single file)
├── components/            # React components (each in own directory)
│   └── styles/            # Shared SCSS variables and mixins
├── hooks/                 # Custom React hooks (feature logic)
├── abilities/             # WordPress Abilities API handlers
├── extensions/            # Block editor filter registrations
├── provider/              # agents-manager integration exports
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── assets/                # Style preset images (WebP)
```

## Conventions

- **Styling**: Dark theme, SCSS modules. Design tokens in `src/components/styles/_variables.scss`. Mixins in `_mixins.scss`.
- **Tracking**: All analytics events prefixed with `jetpack_big_sky_`. Use `recordEvent()` from `src/utils/tracking.ts`.
- **Hooks**: Feature logic is isolated into custom hooks in `src/hooks/`. Prefer composing hooks over adding logic to components.
- **Types**: All types in `src/types/`. Enums for `ImageStudioMode`, `ImageStudioEntryPoint`, `ToolbarOption`, `MetadataField`.
- **i18n**: Use `@wordpress/i18n` for all user-facing strings.
- **Components**: Prefer `@wordpress/components` (Button, Modal, etc.) over custom UI primitives.

## Before Making Changes

1. Understand the store structure in `src/store/index.ts` before modifying state
2. Check existing hooks in `src/hooks/` — the feature you need may already exist
3. Run `yarn workspace @automattic/image-studio tsc --build --dry` to verify types compile

## Code Patterns to Follow

**State changes**: Add new state, actions, and selectors to `src/store/index.ts`. Do not create separate store files.

**New features**: Extract logic into a custom hook in `src/hooks/`. Keep components thin — they should render UI and delegate to hooks.

**New components**: Place in `src/components/<component-name>/` with `index.tsx` and `style.scss`. Use `@wordpress/components` for primitives (Button, Modal, TextControl, etc.).

**Styling**: Use SCSS. Import variables from `../styles/variables`. Follow the dark theme color scheme. The modal uses `$color-background: #1e1e1e` and `$color-foreground: #fff`.

**Types**: Add to `src/types/index.ts` for shared types. Use enums for fixed option sets.

**Analytics**: Use `recordEvent( 'event_name', props )` from `src/utils/tracking.ts`. All events are auto-prefixed with `jetpack_big_sky_`.

**i18n**: All user-facing strings must use `__()` or `_n()` from `@wordpress/i18n`.

## Testing Requirements

- Write unit tests for new hooks and utility functions
- Test files go alongside source: `use-foo.ts` -> `use-foo.test.ts`
- Use `@testing-library/react` for hook tests via `renderHook`
- Mock `@wordpress/data` store interactions in tests

## Build & Verify

```bash
# Initial setup (run once from repo root)
yarn install

# Type check
yarn workspace @automattic/image-studio tsc --build --dry

# Run tests (from repo root)
yarn jest packages/image-studio --config packages/image-studio/jest.config.js

# Build (ESM + CJS)
yarn workspace @automattic/image-studio build

# Deploy in sandbox
cd apps/agents-manager
yarn dev --sync
```

## Deployment

Deployed as part of the `agents-manager` bundle to `widgets.wp.com`. PHP in `jetpack plugins` enqueues the scripts on relevant admin screens.

## Common Pitfalls

- **Store non-serializable values**: `onCloseCallback` and `annotationCanvasRef` are intentionally non-serializable in the store. Don't try to "fix" this.
- **Draft cleanup**: Never delete the original attachment or saved attachments. Only drafts are cleaned up on exit. See `use-draft-cleanup.ts`.
- **Abilities API**: Changes to `update-canvas-image` affect the AI agent contract. Coordinate with the backend agent team.
- **Cross-bundle communication**: Image Studio runs in a separate bundle from the block editor. The store is the bridge. Don't assume direct component access.
- **Asset imports**: WebP style preset images in `src/assets/` are copied during build. Update the build script if adding new asset types.

## PR Guidelines

- Reference the Linear issue ID in the PR title
- Include before/after screenshots for any UI changes
- Test in both Edit and Generate modes if the change affects shared components
- Test in Media Library and Block Editor contexts
