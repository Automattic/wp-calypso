# @automattic/image-studio

AI-powered image editing and generation for WordPress. Two modes: **Edit** (modify existing images) and **Generate** (create new images via AI).

Part of the `wp-calypso` monorepo. Bundled inside `@automattic/agents-manager` and served from `widgets.wp.com`.

## Project Structure

```
src/
├── index.tsx              # Main exports and initialization
├── store/                 # WordPress data store (single file)
├── components/            # React components
│   ├── annotation-canvas/ # Drawing/annotation tools
│   ├── aspect-ratio-picker/ # Aspect ratio selection
│   ├── canvas/            # Image display
│   ├── canvas-controls/   # Revision navigator
│   ├── confirmation-dialog/ # Unsaved changes prompt
│   ├── edit-layout/       # Edit mode container
│   ├── footer/            # Agent chat UI
│   ├── generate-layout/   # Generate mode container
│   ├── header/            # Toolbar, save, navigation
│   ├── image-feedback-buttons/ # Thumbs up/down
│   ├── sidebar/           # Metadata editing, file details
│   ├── style-picker/      # Style selection UI
│   └── styles/            # Shared SCSS variables and mixins
├── hooks/                 # Custom React hooks (feature logic)
├── abilities/             # WordPress Abilities API handlers
├── extensions/            # Block editor filter registrations
├── provider/              # Exports for agents-manager integration
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## How It Works

Image Studio does not run standalone. The loading chain:

1. **Jetpack plugin** (PHP) — enqueues the `agents-manager` script on relevant WordPress admin screens (Media Library, Block Editor, External Media modal)
2. **`agents-manager`** (JS bundle on `widgets.wp.com`) — imports and initializes Image Studio, calls `initImageStudioIntegration()` and `registerBlockEditorFilters()`
3. **Image Studio** — injects UI entry points ("Edit with AI" buttons, "Generate Image" link) and renders the full-screen modal when triggered

Image Studio and the block editor run in **separate bundles**. They communicate through a shared WordPress data store (`src/store/index.ts`) — no direct component access between bundles.

### Key Integration Points

- **Abilities API** (`src/abilities/`) — `image-studio/update-canvas-image` for AI agent integration
- **Block Editor filters** (`src/extensions/`) — toolbar buttons, generate placeholder, external media
- **Provider exports** (`src/provider/`) — `toolProvider` and `contextProvider` for `agents-manager`

### Key Exports

```tsx
// Main entry point
export {
	initImageStudioIntegration, // Initialize on page load
	registerBlockEditorFilters, // Register Gutenberg integrations
	ImageStudio, // Main component
	store, // WordPress data store
} from '@automattic/image-studio';

// Provider exports (for agents-manager)
export {
	toolProvider, // Abilities provider
	contextProvider, // Context provider
} from '@automattic/image-studio/provider';
```

## Development

### Commands

```bash
# Build the package (ESM + CJS)
yarn build

# Watch for changes
yarn watch

# Clean build output
yarn clean

# Lint
yarn lint

# Unit tests (from repo root)
yarn jest packages/image-studio --config packages/image-studio/jest.config.js

# Type check
yarn workspace @automattic/image-studio tsc --build --dry
```

Test files go alongside source: `use-foo.ts` → `use-foo.test.ts`.

### Manual Testing

No local dev server. Image Studio requires a sandbox on `widgets.wp.com`:

```bash
# 1. Add `widgets.wp.com` to your etc/hosts pointing to sandbox IP
# 2. Build and sync (from repo root)
cd apps/agents-manager && yarn dev --sync
```

Then on the sandboxed site:

- **Media Library** (`/wp-admin/upload.php`): Click any image → "Edit with AI", or click "Generate Image"
- **Block Editor**: Add an Image block → "Generate" in placeholder, or select an existing image → "Edit with AI" in toolbar

For comprehensive UI test cases, see [.agents/skills/ui-testing/SKILL.md](.agents/skills/ui-testing/SKILL.md).

### Deployment

Deployed as part of the `agents-manager` bundle to `widgets.wp.com`. PHP in `jetpack-plugin` enqueues scripts on Media Library, Block Editor, and External Media screens.

## Related

- [AGENTS.md](AGENTS.md) — Critical patterns, conventions, and pitfalls for AI agents
- [@automattic/agents-manager](../agents-manager/README.md) — Parent integration package

## License

GPL-2.0-or-later
