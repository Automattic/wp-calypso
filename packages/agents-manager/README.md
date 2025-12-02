# @automattic/agents-manager

Unified AI Agent manager for WordPress and Calypso.

## Features

- **Unified AI Agent**: A complete AI chat interface with docking and floating modes.
- **Conversation History**: View and resume past conversations with automatic caching.
- **Session Management**: Automatic session handling with 24-hour persistence in localStorage.
- **Extensible**: Support for custom tools, context providers, and markdown components.
- **Multi-Context Support**: Works in WordPress (wp-admin, block-editor, site-editor), Calypso, and generic contexts.

## Installation

```bash
yarn add @automattic/agents-manager
```

## Usage

### Basic Integration

The main component is `UnifiedAIAgent`. It handles the initialization of the agent, session management, and UI rendering.

```tsx
import UnifiedAIAgent from '@automattic/agents-manager';

function MyApp() {
	const site = { ID: 456, URL: 'https://example.com' };

	return <UnifiedAIAgent currentRoute="/dashboard" sectionName="dashboard" site={ site } />;
}
```

### Adding Custom Tools

You can extend the agent's capabilities by providing a `toolProvider`. This allows the agent to perform actions specific to your application.

```tsx
import { ToolProvider } from '@automattic/agents-manager';

const myToolProvider: ToolProvider = {
	getAbilities: async () => {
		return [
			{
				name: 'get_latest_posts',
				label: 'Get Latest Posts',
				description: 'Fetches the latest posts from the site',
				category: 'content',
				input_schema: {
					type: 'object',
					properties: {
						limit: { type: 'number', description: 'Number of posts to fetch' },
					},
				},
				callback: async ( params ) => {
					// Implementation to fetch posts
					return JSON.stringify( posts );
				},
			},
		];
	},
	executeAbility: async ( name, args ) => {
		// Handle execution if not handled by individual ability callbacks
		if ( name === 'get_latest_posts' ) {
			return JSON.stringify( posts );
		}
	},
};

// Pass it to the component
// <UnifiedAIAgent toolProvider={ myToolProvider } ... />
```

### Providing Context

Use `contextProvider` to give the agent awareness of the current application state. Context entries support lazy evaluation via `getData` closures.

```tsx
import { ContextProvider } from '@automattic/agents-manager';

const myContextProvider: ContextProvider = {
	getClientContext: () => {
		return {
			url: window.location.href,
			pathname: window.location.pathname,
			search: window.location.search,
			environment: 'my-app',
			contextEntries: [
				{
					id: 'application_state',
					type: 'application_state',
					// Lazy evaluation - getData is called when context is needed
					getData: () => ( {
						currentView: 'editor',
						selectedBlockId: 'block-123',
					} ),
				},
			],
		};
	},
};

// Pass it to the component
// <UnifiedAIAgent contextProvider={ myContextProvider } ... />
```

### Customizing the Empty View

You can provide custom suggestions that appear when the chat is empty.

```tsx
const suggestions = [
	{ id: 'draft-post', label: 'Draft a post', prompt: 'Help me write a blog post about...' },
	{ id: 'analyze-stats', label: 'Analyze stats', prompt: 'How is my site performing today?' },
];

// <UnifiedAIAgent emptyViewSuggestions={ suggestions } ... />
```

### Using the Store

The package exports a data store for managing the agent's UI state.

```tsx
import { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { useDispatch, useSelect } from '@wordpress/data';

function MyComponent() {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { isOpen } = useSelect( ( select ) => select( AGENTS_MANAGER_STORE ).getAgentsManagerState() );

	return <button onClick={ () => setIsOpen( ! isOpen ) }>Toggle Agent</button>;
}
```

## API Reference

### UnifiedAIAgent Props

| Prop                   | Type                 | Description                                                             |
| ---------------------- | -------------------- | ----------------------------------------------------------------------- |
| `currentRoute`         | `string`             | The current route path.                                                 |
| `sectionName`          | `string`             | The name of the current section (e.g., 'posts', 'pages').               |
| `site`                 | `HelpCenterSite`     | The selected site object (from `@automattic/data-stores`).              |
| `currentUser`          | `CurrentUser`        | The current user object (from `@automattic/data-stores`).               |
| `handleClose`          | `() => void`         | Callback to handle closing the agent.                                   |
| `toolProvider`         | `ToolProvider`       | Provider for custom tools/abilities.                                    |
| `contextProvider`      | `ContextProvider`    | Provider for environment-specific context.                              |
| `emptyViewSuggestions` | `Suggestion[]`       | Custom suggestions for the empty view.                                  |
| `markdownComponents`   | `MarkdownComponents` | Custom markdown renderers (from `@automattic/agenttic-ui`).             |
| `markdownExtensions`   | `MarkdownExtensions` | Custom markdown extensions (from `@automattic/agenttic-ui`).            |

### Exported Types

```tsx
import type {
	UnifiedAIAgentProps,
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
} from '@automattic/agents-manager';
```

### ToolProvider Interface

```tsx
interface ToolProvider {
	getAbilities: () => Promise< Ability[] >;
	executeAbility: ( name: string, args: any ) => Promise< any >;
}
```

### Ability Interface

Based on the WordPress Abilities API:

```tsx
interface Ability {
	name: string;
	label: string;
	description: string;
	category: string;
	input_schema?: Record< string, any >;
	output_schema?: Record< string, any >;
	callback?: ( input: any ) => any | Promise< any >;
	permissionCallback?: ( input?: any ) => boolean | Promise< boolean >;
	meta?: {
		annotations?: {
			readonly?: boolean | null;
			destructive?: boolean | null;
			idempotent?: boolean | null;
		};
		[ key: string ]: any;
	};
}
```

### ContextProvider Interface

```tsx
interface ContextProvider {
	getClientContext: () => ClientContextType;
}

interface ClientContextType {
	url: string;
	pathname: string;
	search: string;
	environment: 'wp-admin' | 'ciab-admin' | 'calypso' | string;
	contextEntries?: ContextEntry[];
	[ key: string ]: any;
}

interface BaseContextEntry {
	id: string;
	type: string;
	getData?: () => any; // Lazy data loader
	data?: any; // Resolved data
}
```

## Development

```bash
# Build the package
yarn build

# Watch for changes
yarn watch

# Clean build output
yarn clean
```

## License

GPL-2.0-or-later
