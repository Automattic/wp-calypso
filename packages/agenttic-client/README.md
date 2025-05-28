# Agenttic Client

A TypeScript client library for communicating with WPcom Agent API https://github.a8c.com/Automattic/wpcom/blob/trunk/wp-content/rest-api-plugins/endpoints/ai-agent.php.

## Features

-   **Universal**: Works in both Node.js and browser environments
-   **CLI**: Includes CLI for quick and easy testing of agents
-   **React Integration**: React hook for integration in React applications
-   **Streaming**: Support for both regular and streaming message responses
-   **Tools**: Extensible tool system for agent capabilities
-   **Authentication**: Flexible authentication provider system
-   **Context**: Context injection

## Installation

** NOTE - currently not published so you will need to check out as a submodule in your project to use. **

```bash
npm install @automattic/agenttic-client
```

## Usage

### Browser/React Usage

For browser environments and React applications, use the browser-specific entry point:

```typescript
import {
	useAgent,
	useClientContext,
	useClientTools,
} from '@automattic/agenttic-client/browser';

// React component example
function ChatComponent() {
	// Set up dynamic context that gets fresh data each time a message is sent
	const contextProvider = useClientContext( () => ( {
		currentPage: getCurrentPageData(),
		selectedElements: getSelectedElements(),
		userRole: getCurrentUserRole(),
		timestamp: Date.now(),
	} ) );

	// Set up tools that the agent can use, useClientTools takes getTools, executeTool and toolResultHandler callbacks
	const toolProvider = useClientTools(
		async () => [
			{
				id: 'page-analyzer',
				name: 'Page Analyzer',
				description: 'Analyze the current page structure and content',
				input_schema: {
					type: 'object',
					properties: {
						analysisType: {
							type: 'string',
							enum: [ 'seo', 'accessibility', 'performance' ],
							description: 'Type of analysis to perform',
						},
					},
					required: [ 'analysisType' ],
				},
			},
		],
		async ( toolId: string, args: any ) => {
			switch ( toolId ) {
				case 'page-analyzer':
					return analyzeCurrentPage( args.analysisType );
				default:
					throw new Error( `Unknown tool: ${ toolId }` );
			}
		},
		// Handle tool completion results
		( toolResult ) => {
			console.log( 'Tool completed:', toolResult );
			// toolResult.data contains: { toolCallId, toolId, result }
			// You can update UI, show notifications, etc.
			if ( toolResult.data.toolId === 'page-analyzer' ) {
				//return the result to the agent
			}
		}
	);

	const { state, sendMessage, sendMessageStream } = useAgent( {
		agentId: 'big-sky', // Required: Agent ID to use
		// agentUrl: 'https://custom-agent-url.com/api', // Optional: defaults to WordPress.com
		authProvider: async () => ( { Authorization: 'Bearer your-token' } ), // Optional: defaults to no auth
		contextProvider, // Pass the dynamic context provider
		toolProvider, // Pass the tools provider
	} );

	const handleStreamingMessage = async () => {
		try {
			for await ( const update of sendMessageStream(
				'Analyze the selected elements and suggest improvements'
			) ) {
				console.log( 'Update:', update );
				if ( update.final ) {
					console.log( 'Final response received' );
				}
			}
		} catch ( error ) {
			console.error( 'Streaming error:', error );
		}
	};
}
```

### CLI Usage

### Running the Agent CLI

```bash
pnpm cli --agent test
```
