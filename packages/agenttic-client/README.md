# Agenttic Client

A TypeScript client library for A2A (Agent2Agent) protocol communication with support for both Node.js and browser environments.

## Features

-   🌐 **Universal**: Works in both Node.js and browser environments
-   🔌 **Proxy Support**: SOCKS proxy support in Node.js environments
-   ⚛️ **React Integration**: Built-in React hook for easy integration
-   🔄 **Streaming**: Support for both regular and streaming message responses
-   🛠️ **Tools**: Extensible tool system for agent capabilities
-   🔐 **Authentication**: Flexible authentication provider system

## Installation

```bash
npm install @automattic/agenttic-client
```

## Usage

### Browser/React Usage

For browser environments and React applications, use the browser-specific entry point:

```typescript
import { useAgent } from '@automattic/agenttic-client/browser';

// React component example
function ChatComponent() {
  const { state, sendMessage, sendMessageStream } = useAgent({
    agentUrl: 'https://your-agent-url.com/api',
    authProvider: async () => ({ Authorization: 'Bearer your-token' }),
    timeout: 30000,
  });

  const handleSendMessage = async () => {
    try {
      const task = await sendMessage('Hello, agent!');
      console.log('Response:', task);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStreamingMessage = async () => {
    try {
      for await (const update of sendMessageStream('Hello, agent!')) {
        console.log('Update:', update);
        if (update.final) {
          console.log('Final response received');
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
    }
  };

  return (
    <div>
      <div>Status: {state.isConnected ? 'Connected' : 'Disconnected'}</div>
      {state.error && <div>Error: {state.error}</div>}
      <button onClick={handleSendMessage} disabled={state.isLoading}>
        Send Message
      </button>
      <button onClick={handleStreamingMessage} disabled={state.isLoading}>
        Stream Message
      </button>
    </div>
  );
}
```

### Node.js/CLI Usage

For Node.js environments with SOCKS proxy support:

```typescript
import {
	createA2AClient,
	nodeDispatcher,
} from '@automattic/agenttic-client/node';

const client = createA2AClient( {
	agentUrl: 'https://your-agent-url.com/api',
	authProvider: async () => ( { Authorization: 'Bearer your-token' } ),
	proxy: 'socks://127.0.0.1:8080', // SOCKS proxy support
	dispatcher: nodeDispatcher, // Use Node.js dispatcher for proxy support
	timeout: 30000,
} );

// Send a message
const task = await client.sendMessage( {
	message: {
		role: 'user',
		parts: [ { type: 'text', text: 'Hello, agent!' } ],
	},
} );

// Stream a message
for await ( const update of client.sendMessageStream( {
	message: {
		role: 'user',
		parts: [ { type: 'text', text: 'Hello, agent!' } ],
	},
} ) ) {
	console.log( 'Update:', update );
}
```

### Generic Usage (Auto-detects Environment)

```typescript
import { createA2AClient } from '@automattic/agenttic-client';

const client = createA2AClient( {
	agentUrl: 'https://your-agent-url.com/api',
	authProvider: async () => ( { Authorization: 'Bearer your-token' } ),
	timeout: 30000,
} );
```

## API Reference

### useAgent Hook

The `useAgent` hook provides a React-friendly interface for agent communication.

#### Parameters

-   `config: UseAgentConfig` - Configuration object for the agent client

#### Returns

```typescript
interface UseAgentReturn {
	state: AgentState;
	sendMessage: (
		message: string,
		options?: Partial< SendMessageParams >
	) => Promise< Task >;
	sendMessageStream: (
		message: string,
		options?: Partial< SendMessageParams >
	) => AsyncIterable< TaskUpdate >;
	clearError: () => void;
	reset: () => void;
}
```

#### State

```typescript
interface AgentState {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
	lastResponse: Task | null;
}
```

### Client Configuration

```typescript
interface A2AClientConfig {
	agentUrl: string;
	authProvider?: AuthProvider;
	defaultSessionId?: string;
	timeout?: number;
	proxy?: string;
	toolProvider?: ToolProvider;
	contextProvider?: ContextProvider;
	dispatcher?: RequestDispatcher;
}
```

### Authentication

Provide an authentication function that returns headers:

```typescript
const authProvider: AuthProvider = async () => {
	return {
		Authorization: 'Bearer your-token',
		'X-API-Key': 'your-api-key',
	};
};
```

### Tools

Implement the `ToolProvider` interface to add tool capabilities:

```typescript
const toolProvider: ToolProvider = {
	async getAvailableTools() {
		return [
			{
				id: 'calculator',
				name: 'Calculator',
				description: 'Perform mathematical calculations',
				input_schema: {
					type: 'object',
					properties: {
						expression: { type: 'string' },
					},
					required: [ 'expression' ],
				},
			},
		];
	},

	async executeTool( toolId: string, args: any ) {
		if ( toolId === 'calculator' ) {
			// Implement calculator logic
			return { result: eval( args.expression ) };
		}
		throw new Error( `Unknown tool: ${ toolId }` );
	},
};
```

### Context

Provide context information to the agent:

```typescript
const contextProvider: ContextProvider = {
	getClientContext() {
		return {
			userAgent: navigator.userAgent,
			timestamp: new Date().toISOString(),
			// Add any relevant context
		};
	},
};
```

## Build Targets

The library provides different entry points optimized for different environments:

-   **`@automattic/agenttic-client`** - Main entry point (auto-detects environment)
-   **`@automattic/agenttic-client/browser`** - Browser-optimized build with React hooks
-   **`@automattic/agenttic-client/node`** - Node.js build with SOCKS proxy support
-   **`@automattic/agenttic-client/cli`** - CLI tools and utilities

## Environment Isolation

The library uses a dispatcher pattern to isolate environment-specific dependencies:

-   **Browser**: Uses `BrowserDispatcher` (no proxy support, warns if proxy is configured)
-   **Node.js**: Uses `NodeDispatcher` (full SOCKS proxy support via `fetch-socks`)

This ensures that Node.js-specific dependencies like `fetch-socks` don't break browser builds.

## Development

```bash
# Install dependencies
pnpm install

# Build all targets
pnpm run build

# Run tests
pnpm run test

# Run CLI
pnpm run cli --help
```

## License

MIT
