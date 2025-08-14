# @automattic/agenttic-client

A TypeScript client library for Agent2Agent (A2A) protocol communication with React hooks and component integration. Built for seamless AI agent integration in both browser and Node.js environments.

## Installation

```bash
npm install @automattic/agenttic-client
```

## Key Features

-   React hooks for agent communication (`useAgentChat`, `useClientContext`, `useClientTools`)
-   Streaming and non-streaming responses
-   Tool execution system with automatic handling
-   Context injection for each message
-   Conversation persistence and management
-   TypeScript support
-   Message actions and markdown rendering

## Quick Start

### Basic Chat Integration

```typescript
import { useAgentChat } from '@automattic/agenttic-client';

function ChatComponent() {
  const {
    messages,
    isProcessing,
    error,
    onSubmit,
    registerSuggestions,
    registerMarkdownComponents
  } = useAgentChat({
    agentId: 'big-sky',
    sessionId: 'my-session-123',
    authProvider: async () => ({ Authorization: 'Bearer your-token' })
  });

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id} className={msg.role}>
          {msg.content.map(content => content.text).join('')}
        </div>
      ))}
      <input
        onKeyDown={(e) => e.key === 'Enter' && onSubmit(e.target.value)}
        disabled={isProcessing}
      />
      {error && <div>Error: {error}</div>}
    </div>
  );
}
```

### With Tools and Context

```typescript
import { useAgentChat, useClientTools, useClientContext } from '@automattic/agenttic-client';

function AdvancedChatComponent() {
  const contextProvider = useClientContext(() => ({
    page: window.location.href,
    timestamp: Date.now(),
    userRole: getCurrentUserRole()
  }));

  const toolProvider = useClientTools(
    async () => [
      {
        id: 'calculator',
        name: 'Calculator',
        description: 'Perform mathematical calculations',
        input_schema: {
          type: 'object',
          properties: {
            expression: { type: 'string' }
          },
          required: ['expression']
        }
      }
    ],
    async (toolId, args) => {
      if (toolId === 'calculator') {
        return { result: calc(args.expression)};
      }
    }
  );

  const chat = useAgentChat({
    agentId: 'big-sky',
    contextProvider,
    toolProvider,
    authProvider: async () => ({ Authorization: 'Bearer token' })
  });

  return <ChatInterface {...chat} />;
}
```

## Core APIs

### useAgentChat Hook

The primary hook for chat functionality, providing everything needed for a complete chat interface.

```typescript
const {
	// Chat state
	messages, // UIMessage[] - formatted for display
	isProcessing, // boolean - request in progress
	error, // string | null - last error

	// Core methods
	onSubmit, // (message: string) => Promise<void>

	// Configuration
	registerSuggestions, // (suggestions: Suggestion[]) => void
	registerMarkdownComponents, // (components: MarkdownComponents) => void
	registerMessageActions, // (registration: MessageActionsRegistration) => void

	// Utilities
	messageRenderer, // React component for markdown rendering
	addMessage, // (message: UIMessage) => void
} = useAgentChat( config );
```

**Config Options:**

-   `agentId: string` - Required. Agent identifier
-   `agentUrl?: string` - Agent endpoint URL (defaults to WordPress.com)
-   `sessionId?: string` - Session ID for conversation persistence
-   `contextProvider?: ContextProvider` - Dynamic context injection
-   `toolProvider?: ToolProvider` - Tool execution capabilities
-   `authProvider?: AuthProvider` - Authentication headers

### useClientContext Hook

Provides dynamic context that refreshes with each message.

```typescript
const contextProvider = useClientContext( () => ( {
	currentPage: {
		url: window.location.href,
		title: document.title,
		selectedText: getSelection(),
	},
	user: {
		role: getUserRole(),
		permissions: getPermissions(),
	},
	timestamp: Date.now(),
} ) );
```

### useClientTools Hook

Enables agents to execute tools in your application.

```typescript
const toolProvider = useClientTools(
	// Define available tools
	async () => [
		{
			id: 'file-reader',
			name: 'File Reader',
			description: 'Read file contents',
			input_schema: {
				type: 'object',
				properties: {
					path: { type: 'string' },
				},
				required: [ 'path' ],
			},
		},
	],
	// Execute tool calls
	async ( toolId, args ) => {
		if ( toolId === 'file-reader' ) {
			return { content: await readFile( args.path ) };
		}
		throw new Error( `Unknown tool: ${ toolId }` );
	}
);
```

### createClient Function

Low-level client for direct A2A communication without React.

```typescript
import { createClient } from '@automattic/agenttic-client';

const client = createClient({
  agentId: 'big-sky',
  authProvider: async () => ({ Authorization: 'Bearer token' }),
  toolProvider: {
    getAvailableTools: async () => [...],
    executeTool: async (toolId, args) => ({ result: '...' })
  }
});

// Non-streaming
const task = await client.sendMessage({
  message: createTextMessage('Hello'),
  sessionId: 'session-123'
});

// Streaming
for await (const update of client.sendMessageStream({
  message: createTextMessage('Hello'),
  sessionId: 'session-123'
})) {
  console.log(update.text);
  if (update.final) break;
}
```

### Agent Manager

Functional singleton for managing multiple agent instances.

```typescript
import { getAgentManager } from '@automattic/agenttic-client';

const manager = getAgentManager();

// Create agent
await manager.createAgent( 'my-agent', {
	agentId: 'big-sky',
	sessionId: 'session-123',
	contextProvider,
	toolProvider,
} );

// Send messages
const task = await manager.sendMessage( 'my-agent', 'Hello' );

// Streaming
for await ( const update of manager.sendMessageStream( 'my-agent', 'Hello' ) ) {
	console.log( update );
}

// Manage conversation
const history = manager.getConversationHistory( 'my-agent' );
await manager.resetConversation( 'my-agent' );
```

## Additional Features

### Message Actions

Add interactive buttons to agent messages:

```typescript
const { registerMessageActions, createFeedbackActions } =
	useAgentChat( config );

// Built-in feedback actions
registerMessageActions(
	createFeedbackActions( {
		onFeedback: async ( messageId, feedback ) => {
			console.log( `${ feedback } feedback for ${ messageId }` );
		},
		icons: { up: '👍', down: '👎' },
	} )
);

// Custom actions
registerMessageActions( {
	id: 'copy-actions',
	actions: [
		{
			id: 'copy',
			label: 'Copy',
			icon: '📋',
			onClick: ( message ) =>
				navigator.clipboard.writeText( message.content[ 0 ].text ),
		},
	],
} );
```

### Markdown Extensions

Extend markdown rendering with custom components:

```typescript
import { BarChart, LineChart } from '@automattic/agenttic-client';

const { registerMarkdownComponents, registerMarkdownExtensions } = useAgentChat(config);
// Register chart components
registerMarkdownComponents( {
  // Custom heading styles
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-brand">{children}</h1>
  ),
  // Custom code blocks with syntax highlighting
  code: ({ children, className }) => (
    <SyntaxHighlighter language={className}>
    {children}
    </SyntaxHighlighter>
  ),
  // Custom link handling
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener">
    {children} ↗
    </a>
  ),
  blockquote: ( { children, ...props } ) => (
    <blockquote
      { ...props }
      style={ {
        borderLeft: '4px solid #007cba',
        backgroundColor: '#f0f8ff',
        margin: '16px 0',
        padding: '12px 16px',
        fontStyle: 'italic',
        borderRadius: '0 4px 4px 0',
      } }
    >
      { children }
    </blockquote>
  ),
});

// Register custom extensions
registerMarkdownExtensions({
  charts: {
    BarChart,
    LineChart
  }
});
```

### Conversation Suggestions

Provide suggested prompts to users:

```typescript
const { registerSuggestions, clearSuggestions } = useAgentChat( config );

registerSuggestions( [
	{
		id: '1',
		label: 'Help me write code',
		prompt: 'Can you help me write a function?',
	},
	{
		id: '2',
		label: 'Explain this error',
		prompt: 'What does this error mean?',
	},
] );
```

## Type Definitions

```typescript
interface UIMessage {
	id: string;
	role: 'user' | 'agent';
	content: Array< {
		type: 'text' | 'image_url' | 'component';
		text?: string;
		image_url?: string;
		component?: React.ComponentType;
	} >;
	timestamp: number;
	actions?: UIMessageAction[];
}

interface Tool {
	id: string;
	name: string;
	description: string;
	input_schema: {
		type: 'object';
		properties: Record< string, any >;
		required?: string[];
	};
}

type AuthProvider = () => Promise< Record< string, string > >;
type ContextProvider = { getClientContext: () => any };
type ToolProvider = {
	getAvailableTools: () => Promise< Tool[] >;
	executeTool: ( toolId: string, args: any ) => Promise< any >;
};
```

## Development

```bash
# Build the package
pnpm build

# Run tests
pnpm test

# Type checking
pnpm type-check

# Lint
pnpm lint
```
