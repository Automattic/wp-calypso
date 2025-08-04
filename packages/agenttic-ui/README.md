# @automattic/agenttic-ui

UI components for the Agenttic framework.

## Installation

```bash
pnpm install @automattic/agenttic-ui
```

## Usage

```typescript
import { /* components */ } from '@automattic/agenttic-ui';
```

### CSS

The package automatically imports its CSS styles when you import any component.

If you need to import the CSS separately (e.g., for server-side rendering or specific build configurations), you can import it directly:

```css
/* In your CSS file */
@import '@automattic/agenttic-ui/index.css';
```

Or in JavaScript:

```javascript
import '@automattic/agenttic-ui/index.css';
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run in development mode
pnpm dev

# Run tests
pnpm test

# Type check
pnpm type-check
```

## Demo Application

A demo application is available in the `demo/` directory to test the UI components.

### Running the Demo

You can run the demo in two different modes:

#### Source Mode (Development)
```bash
# From the demo directory
pnpm dev
```

This runs the demo using the **source code** directly from the UI package. This is useful for active development and sees changes immediately.

#### Build Mode (Production Testing)
```bash
# First build the UI package
cd packages/agenttic-ui
pnpm run build

# Then run the demo with the built package
pnpm dev --mode use-ui-build
```

This runs the demo using the **built/bundled UI package**. This mode:
- Shows a green banner "📦 Running with Built UI Package" to indicate build mode
- Tests the actual production bundle that would be published
- Verifies CSS Modules scoping works correctly in the built package
- Useful for testing before publishing

The demo will start on [http://localhost:3001](http://localhost:3001) in both modes.

## Storybook

Agenttic UI includes a Storybook setup for component development and documentation.

### Running Storybook

```bash
# Start Storybook development server
pnpm storybook
```

Storybook will start on [http://localhost:6006](http://localhost:6006)
