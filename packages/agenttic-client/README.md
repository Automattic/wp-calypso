# Agenttic Client

A TypeScript client library for communicating with WPcom Agent API with support for both Node.js and browser environments.

## Features

-   🌐 **Universal**: Works in both Node.js and browser environments
-   🔌 **Proxy Support**: SOCKS proxy support in Node.js environments
-   ⚛️ **React Integration**: Built-in React hook for easy integration
-   🔄 **Streaming**: Support for both regular and streaming message responses
-   🛠️ **Tools**: Extensible tool system for agent capabilities
-   🔐 **Authentication**: Flexible authentication provider system
-   📄 **Dynamic Context**: Real-time context injection with `useClientContext`

## Installation

```bash
npm install @automattic/agenttic-client
```

## Usage

### Browser/React Usage

For browser environments and React applications, use the browser-specific entry point:

```typescript
import { useAgent, useClientContext } from '@automattic/agenttic-client/browser';

// React component example
function ChatComponent() {
  // Set up dynamic context that gets fresh data each time a message is sent
  const contextProvider = useClientContext(() => ({
    currentPage: getCurrentPageData(), // Fresh data each time
    selectedElements: getSelectedElements(), // Fresh data each time
    userRole: getCurrentUserRole(), // Fresh data each time
    timestamp: Date.now(), // Always fresh
  }));

  const { state, sendMessage, sendMessageStream } = useAgent({
    agentUrl: 'https://your-agent-url.com/api',
    authProvider: async () => ({ Authorization: 'Bearer your-token' }),
    contextProvider, // Pass the dynamic context provider
    timeout: 30000,
  });

  const handleSendMessage = async () => {
    try {
      // Context is automatically fetched fresh and included in the message
      const task = await sendMessage('Help me with the current page');
      console.log('Response:', task);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleStreamingMessage = async () => {
    try {
      for await (const update of sendMessageStream('Analyze the selected elements')) {
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

### WordPress Integration Example

Perfect for WordPress environments where context changes frequently:

```typescript
import { useAgent, useClientContext } from '@automattic/agenttic-client/browser';
import { useSelect } from '@wordpress/data';
import { store as blockEditorStore } from '@wordpress/block-editor';

function WordPressAgentChat() {
  // Get fresh WordPress data each time
  const { getSelectedBlocks, getCurrentPost } = useSelect(blockEditorStore);

  const contextProvider = useClientContext(() => ({
    currentPost: getCurrentPost(),
    selectedBlocks: getSelectedBlocks(),
    editorMode: getEditorMode(),
    // Any other dynamic WordPress data
  }));

  const { sendMessage } = useAgent({
    agentUrl: 'https://your-wordpress-agent.com/api',
    contextProvider,
  });

  const handleHelp = () => {
    // Fresh WordPress context is automatically included
    sendMessage('Help me improve this post');
  };

  return <button onClick={handleHelp}>Get AI Help</button>;
}
```

### Node.js/CLI Usage

For Node.js environments with SOCKS proxy support:

```typescript
import { createClient, nodeDispatcher } from '@automattic/agenttic-client/node';

const client = createClient( {
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
import { createClient } from '@automattic/agenttic-client';

const client = createClient( {
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

### useClientContext Hook

The `useClientContext` hook creates a context provider from a callback function that gets called fresh each time a message is sent.

#### Parameters

-   `getClientContextCallback?: () => ClientContext` - Function that returns fresh context data

#### Returns

-   `ContextProvider | undefined` - Context provider instance or undefined if no callback provided

#### Example

```typescript
const contextProvider = useClientContext( () => ( {
	// This function is called fresh each time a message is sent
	currentData: getCurrentData(),
	timestamp: Date.now(),
	dynamicValue: computeDynamicValue(),
} ) );
```

### Client Configuration

```typescript
interface ClientConfig {
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

	// Optional: Handle tool completion results
	onToolCompletion: ( toolResult ) => {
		console.log( 'Tool completed:', toolResult );
		// toolResult.data contains: { toolCallId, toolId, result }
		// Send result back to agent, store in database, etc.
	},
};
```

#### useClientTools Hook

For React applications, use the `useClientTools` hook to create a tool provider:

```typescript
import { useClientTools } from '@automattic/agenttic-client/browser';

function MyComponent() {
	const toolProvider = useClientTools(
		// Tool provider callback
		() => ( {
			getTools: async () => [
				{
					id: 'calculator',
					name: 'Calculator',
					description: 'Perform calculations',
					input_schema: {
						type: 'object',
						properties: {
							expression: { type: 'string' },
						},
						required: [ 'expression' ],
					},
				},
			],
			executeTool: async ( toolId: string, args: any ) => {
				if ( toolId === 'calculator' ) {
					return { result: eval( args.expression ) };
				}
				throw new Error( `Unknown tool: ${ toolId }` );
			},
		} ),
		// Optional: Tool completion callback
		( toolResult ) => {
			console.log( 'Tool completed:', toolResult );
			// Handle the tool result - send back to agent, store, etc.
			// toolResult.data contains: { toolCallId, toolId, result }
		}
	);

	// Use toolProvider with useAgent hook...
}
```

### Dynamic Context

The context system is designed to provide fresh, real-time data with each message:

```typescript
// ❌ Don't store context in state (stale data)
const [ context, setContext ] = useState( { data: 'static' } );

// ✅ Use callback for fresh data each time
const contextProvider = useClientContext( () => ( {
	data: getFreshData(), // Called fresh each time
	timestamp: Date.now(), // Always current
} ) );
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
