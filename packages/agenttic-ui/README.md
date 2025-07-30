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

## Storybook

Agenttic UI includes a Storybook setup for component development and documentation.

### Running Storybook

```bash
# Start Storybook development server
pnpm storybook
```

Storybook will start on [http://localhost:6006](http://localhost:6006)
