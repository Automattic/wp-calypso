# Agenttic Client

A TypeScript client library for communicating with AI agents through the Agent-to-Agent (A2A) protocol. Designed for seamless integration in React applications and WordPress environments, with full support for streaming responses, dynamic context injection, and extensible tool systems.

## Features

-   **React Integration**: Purpose-built React hooks for agent communication
-   **Streaming Support**: Real-time streaming responses with async iterables
-   **Dynamic Context**: Inject fresh context data with each message
-   **Tool System**: Extensible tool execution framework
-   **Universal**: Works in both browser and Node.js environments
-   **CLI Interface**: Command-line tool for testing and development
-   **TypeScript**: Full TypeScript support with comprehensive type definitions
-   **Authentication**: Flexible authentication provider system

## Installation

**Note**: This package is currently not published to npm. You will need to include it as a submodule or local dependency in your project.

```bash
npm install @automattic/agenttic-client
```

## Quick Start

```typescript
import {
	useAgent,
	useClientContext,
	useClientTools,
} from '@automattic/agenttic-client/browser';

function ChatComponent() {
	// Dynamic context that refreshes with each message
	const contextProvider = useClientContext(() => ({
		currentPage: getCurrentPageData(),
		userRole: getCurrentUserRole(),
		selectedElements: getSelectedElements(),
		timestamp: Date.now(),
	}));

	// Tools the agent can use
	const toolProvider = useClientTools(
		async () => [
			{
				id: 'page-analyzer',
				name: 'Page Analyzer',
				description: 'Analyze current page structure',
				input_schema: {
					type: 'object',
					properties: {
						analysisType: {
							type: 'string',
							enum: ['seo', 'accessibility', 'performance'],
						},
					},
					required: ['analysisType'],
				},
			},
		],
		async (toolId: string, args: any) => {
			if (toolId === 'page-analyzer') {
				return analyzeCurrentPage(args.analysisType);
			}
			throw new Error(`Unknown tool: ${toolId}`);
		}
	);

	const { state, sendMessage, sendMessageStream } = useAgent({
		agentId: 'big-sky',
		contextProvider,
		toolProvider,
		authProvider: async () => ({ Authorization: 'Bearer your-token' }),
	});

	// Send a regular message
	const handleMessage = async () => {
		try {
			const response = await sendMessage('Analyze this page for SEO');
			console.log('Agent response:', response.status?.message);
		} catch (error) {
			console.error('Error:', error);
		}
	};

	// Send a streaming message
	const handleStreamingMessage = async () => {
		try {
			for await (const update of sendMessageStream('Analyze this page')) {
				console.log('Streaming update:', update);
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
			<p>Connected: {state.isConnected ? 'Yes' : 'No'}</p>
			<p>Loading: {state.isLoading ? 'Yes' : 'No'}</p>
			{state.error && <p>Error: {state.error}</p>}
			<button onClick={handleMessage}>Send Message</button>
			<button onClick={handleStreamingMessage}>Send Streaming</button>
		</div>
	);
}
```

## React Integration

### useAgent Hook

The core hook for agent communication and state management.

```typescript
import { useAgent } from '@automattic/agenttic-client/browser';

const {
	state,
	sendMessage,
	sendMessageStream,
	clearError,
	reset,
	resetConversation,
} = useAgent( {
	agentId: 'big-sky', // Required: Agent identifier
	agentUrl: 'https://custom-url.com', // Optional: Custom agent URL
	authProvider: async () => headers, // Optional: Authentication headers
	contextProvider, // Optional: Dynamic context provider
	toolProvider, // Optional: Tool execution provider
	timeout: 30000, // Optional: Request timeout in ms
} );
```

#### State Object

```typescript
interface AgentState {
	isConnected: boolean; // Client connection status
	isLoading: boolean; // Request in progress
	error: string | null; // Last error message
	lastResponse: Task | null; // Most recent response
	conversationHistory: Message[]; // Message history
}
```

#### Methods

-   `sendMessage(text, options?)`: Send a message and wait for complete response
-   `sendMessageStream(text, options?)`: Send a message and receive streaming updates
-   `clearError()`: Clear the current error state
-   `reset()`: Reset all state including conversation history
-   `resetConversation()`: Clear only conversation history

### useClientContext Hook

Provides dynamic context injection for each message.

```typescript
import { useClientContext } from '@automattic/agenttic-client/browser';

const contextProvider = useClientContext( () => {
	// This function is called fresh for each message
	return {
		currentPage: {
			url: window.location.href,
			title: document.title,
			content: getPageContent(),
		},
		userInfo: {
			role: getCurrentUserRole(),
			permissions: getUserPermissions(),
		},
		wordpress: {
			version: getWPVersion(),
			activeTheme: getActiveTheme(),
			plugins: getActivePlugins(),
		},
		timestamp: Date.now(),
	};
} );
```

The context callback is invoked each time a message is sent, ensuring the agent always receives fresh, current data about the user's environment.

### useClientTools Hook

Enables the agent to execute tools in your application.

```typescript
import { useClientTools } from '@automattic/agenttic-client/browser';

const toolProvider = useClientTools(
	// Get available tools
	async () => [
		{
			id: 'create-page',
			name: 'Create Page',
			description: 'Create a new WordPress page',
			input_schema: {
				type: 'object',
				properties: {
					title: { type: 'string' },
					content: { type: 'string' },
					status: { type: 'string', enum: [ 'draft', 'publish' ] },
				},
				required: [ 'title', 'content' ],
			},
		},
		{
			id: 'update-theme',
			name: 'Update Theme Settings',
			description: 'Update theme customizer settings',
			input_schema: {
				type: 'object',
				properties: {
					setting: { type: 'string' },
					value: { type: 'string' },
				},
				required: [ 'setting', 'value' ],
			},
		},
	],
	// Execute tool
	async ( toolId: string, args: any ) => {
		switch ( toolId ) {
			case 'create-page':
				return await createWordPressPage(
					args.title,
					args.content,
					args.status
				);
			case 'update-theme':
				return await updateThemeSetting( args.setting, args.value );
			default:
				throw new Error( `Unknown tool: ${ toolId }` );
		}
	}
);
```

## Advanced Usage

### Authentication

```typescript
// Token-based authentication
const authProvider = async () => ( {
	Authorization: 'Bearer your-jwt-token',
} );

// Custom authentication
const authProvider = async () => ( {
	'X-API-Key': process.env.API_KEY,
	'X-User-ID': getCurrentUserId(),
} );
```

### Message Options

```typescript
// Send message without conversation history
await sendMessage( 'Hello', { withHistory: false } );

// Send custom message structure
await sendMessage( '', {
	message: {
		role: 'user',
		parts: [
			{ type: 'text', text: 'Analyze this:' },
			{ type: 'data', data: { customData: 'value' } },
		],
	},
} );
```

### Error Handling

```typescript
const { state, sendMessage, clearError } = useAgent( config );

// Handle errors from state
if ( state.error ) {
	console.error( 'Agent error:', state.error );
	// Clear error when ready
	clearError();
}

// Handle errors from method calls
try {
	await sendMessage( 'Hello' );
} catch ( error ) {
	console.error( 'Send error:', error );
}
```

### TypeScript Support

The library provides comprehensive TypeScript definitions:

```typescript
import type {
	UseAgentConfig,
	AgentState,
	Task,
	TaskUpdate,
	Tool,
	ClientContext,
} from '@automattic/agenttic-client';
```

## CLI Usage

The package includes a command-line interface for testing and development.

### Installation

After building the package:

```bash
npm run build
npm run cli -- --help
```

### Basic Usage

```bash
# Start interactive mode
npm run cli

# Send initial message and continue interactively
npm run cli "Hello, agent!"

# Use different agent
npm run cli --agent custom-agent

# Enable streaming mode
npm run cli --stream "Analyze this request"
```

### CLI Options

-   `-a, --agent <name>`: Agent name (default: big-sky)
-   `-u, --url <url>`: Custom agent URL
-   `-t, --token <token>`: Authentication token
-   `-s, --session <id>`: Session ID for conversation continuity
-   `--timeout <ms>`: Request timeout in milliseconds
-   `-p, --proxy <proxy>`: Proxy URL (default: socks://127.0.0.1:8080)
-   `--no-proxy`: Disable proxy
-   `--stream`: Enable streaming mode
-   `--auth`: Enable authentication (uses environment variables)
-   `--tools`: Enable example tools (echo, calculator, current_time)
-   `--context`: Enable mock client context
-   `-v, --verbose`: Enable verbose output
-   `-h, --help`: Show help message

### Examples

```bash
# Interactive mode with authentication
npm run cli --auth --tools

# Test specific agent with streaming
npm run cli --agent my-agent --stream "Help me build a website"

# Use custom URL without proxy
npm run cli --url https://my-agent.com/api --no-proxy

# Enable all features
npm run cli --auth --tools --context --stream --verbose
```

### Environment Variables

The CLI supports authentication through environment variables:

-   `JETPACK_JWT`: JWT token for authentication

Create a `.env` file in the package root:

```env
JETPACK_JWT=your-jwt-token-here
```

## API Reference

### Core Types

```typescript
interface UseAgentConfig {
	agentId: string; // Required: Agent identifier
	agentUrl: string; // Agent URL
	authProvider?: AuthProvider; // Optional: Authentication provider
	contextProvider?: ContextProvider; // Optional: Context provider
	toolProvider?: ToolProvider; // Optional: Tool provider
	timeout?: number; // Optional: Request timeout
}

interface AgentState {
	isConnected: boolean;
	isLoading: boolean;
	error: string | null;
	lastResponse: Task | null;
	conversationHistory: Message[];
}

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
	resetConversation: () => void;
}
```

### Hook Types

```typescript
type GetClientContextCallback = () => ClientContext;
type GetClientToolsCallback = () => Promise< Tool[] >;
type ExecuteToolCallback = ( toolId: string, args: any ) => Promise< any >;
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npm run type-check
```

### CLI Development

```bash
npm run build:cli
npm run test:cli
```
