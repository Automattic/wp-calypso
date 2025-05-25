# @automattic/agenttic-client

A TypeScript client library for Agenttic.

## Installation

```bash
pnpm add @automattic/agenttic-client
```

## Usage

```typescript
import { AgentticClient } from "@automattic/agenttic-client";

// Create a new client instance
const client = new AgentticClient({
  apiKey: "your-api-key",
  baseUrl: "https://api.agenttic.com",
});

// Get current configuration
const config = client.getConfig();

// Update configuration
client.updateConfig({
  apiKey: "new-api-key",
});
```

## API Reference

### `AgentticClient`

The main client class for interacting with the Agenttic API.

#### Constructor

```typescript
new AgentticClient(config?: AgentticClientConfig)
```

#### Methods

- `getConfig()`: Returns the current client configuration
- `updateConfig(newConfig)`: Updates the client configuration

### Types

#### `AgentticClientConfig`

```typescript
interface AgentticClientConfig {
  apiKey?: string;
  baseUrl?: string;
}
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

# Lint
pnpm lint
```

## License

MIT
