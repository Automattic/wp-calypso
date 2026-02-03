# @automattic/image-studio

AI-powered image editing and generation for WordPress. Provides a full-screen editor experience for generating new images and editing existing ones using AI.

## Installation

```bash
yarn add @automattic/image-studio
```

## Usage

### Basic Integration

Initialize Image Studio on a WordPress admin page:

```tsx
import { initImageStudioIntegration, registerBlockEditorFilters } from '@automattic/image-studio';

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initImageStudioIntegration );
} else {
	initImageStudioIntegration();
}

// Register block editor integrations (toolbar buttons, etc.)
registerBlockEditorFilters();
```

### Provider Integration (Agents Manager)

For use with `@automattic/agents-manager`, import the provider exports:

```tsx
import { toolProvider, contextProvider } from '@automattic/image-studio/provider';

// These can be registered with the agents manager
```

### Using the Store

Image Studio exposes a WordPress data store for state management:

```tsx
import { useDispatch, useSelect } from '@wordpress/data';

function MyComponent() {
	const { setImageStudioOpen } = useDispatch( 'image-studio' );
	const isOpen = useSelect( ( select ) => select( 'image-studio' ).getIsImageStudioOpen() );

	return <button onClick={ () => setImageStudioOpen( true ) }>Open Image Studio</button>;
}
```

## Testing

### Unit Tests

Run the unit tests with Jest:

```bash
# From wp-calypso root
yarn workspace @automattic/image-studio test

# Or from the package directory
cd packages/image-studio
yarn test
```

Test files are located alongside their source files with `.test.ts` or `.test.tsx` extensions.

### Manual Testing

**Step 1 — Build the package:**

```bash
yarn workspace @automattic/image-studio build
```

**Step 2 — Test on a WordPress site:**

- Navigate to Media Library: `/wp-admin/upload.php?flags=image-studio-calypso`
- Click on any image to open Image Studio in Edit mode
- Or click "Generate" to create new images

**Step 3 — Test in Block Editor:**

- Open the post/page editor
- Add an Image block
- Select the image and look for the Image Studio toolbar button

### E2E Testing

For end-to-end testing with Playwright:

```bash
# From wp-calypso root
yarn workspace @automattic/calypso-e2e test --grep "image-studio"
```

## Deployment

### Development Build

```bash
# Build the package
yarn workspace @automattic/image-studio build

# Watch for changes during development
yarn workspace @automattic/image-studio watch
```

### Production Deployment

Image Studio is deployed as part of the `agents-manager` bundle to `widgets.wp.com`:

**Build agents-manager app:**

```bash
yarn workspace @automattic/agents-manager build
```

**The bundle is deployed to:**

- `https://widgets.wp.com/agents-manager/image-studio.min.js`
- `https://widgets.wp.com/agents-manager/image-studio.css`

**PHP enqueues the scripts** in `jetpack-mu-wpcom` when on an Image Studio screen:

- Media Library (`upload.php`)
- Block Editor (when editing images)
- External Media modal

### Feature Flags

| Flag                   | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| `image-studio-calypso` | Enables Image Studio from Calypso (without Big Sky plugin) |

Use via URL: `?flags=image-studio-calypso`

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

# Type check
yarn tsc --noEmit
```

### Project Structure

```
src/
├── index.tsx              # Main exports and initialization
├── store/                 # WordPress data store
├── components/            # React components
│   ├── image-studio/      # Main Image Studio UI
│   ├── annotation-canvas/ # Drawing/annotation tools
│   ├── canvas-controls/   # Image manipulation controls
│   └── style-picker/      # Style selection UI
├── hooks/                 # Custom React hooks
├── abilities/             # WordPress Abilities API integrations
├── extensions/            # Block editor filters
├── provider/              # Exports for agents-manager integration
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

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

## Architecture

### Store

The `image-studio` store manages:

- Current image state (URL, attachment ID, metadata)
- UI state (open/closed, mode, dialogs)
- Draft management (temporary images during editing)
- Undo/redo history

### Abilities

Image Studio registers WordPress Abilities for AI agent integration:

- `image-studio/update-canvas-image` - Update the displayed image

### Block Editor Integration

Filters registered for Gutenberg:

- Image block toolbar button
- Generate button in image placeholder
- External media integration

## Related Documentation

- [NOT_IMPLEMENTED.md](./NOT_IMPLEMENTED.md) - Features not yet migrated
- [Migration Plan](/.claude/plans/kind-crunching-manatee.md) - Original migration plan
- [@automattic/agents-manager](../agents-manager/README.md) - Parent integration package

## License

GPL-2.0-or-later
