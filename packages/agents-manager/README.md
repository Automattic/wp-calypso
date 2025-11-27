# @automattic/agents-manager

Unified AI Agent manager for WordPress and Calypso.

## Features

- **Unified AI Agent**: A complete AI chat interface with docking and floating modes.
- **Conversation History**: View and resume past conversations.
- **Session Management**: Automatic session handling with persistence.
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
	const currentUser = { ID: 123, login: 'user' };
	const site = { ID: 456, URL: 'https://example.com' };

	return (
		<UnifiedAIAgent
			currentRoute="/dashboard"
			sectionName="dashboard"
			currentUser={ currentUser }
			site={ site }
		/>
	);
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
				execute: async ( params ) => {
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

Use `contextProvider` to give the agent awareness of the current application state.

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
					type: 'application_state',
					data: {
						currentView: 'editor',
						selectedBlockId: 'block-123',
					},
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
	{ label: 'Draft a post', prompt: 'Help me write a blog post about...' },
	{ label: 'Analyze stats', prompt: 'How is my site performing today?' },
];

// <UnifiedAIAgent emptyViewSuggestions={ suggestions } ... />
```

## API Reference

### UnifiedAIAgent Props

| Prop                   | Type                 | Description                                               |
| ---------------------- | -------------------- | --------------------------------------------------------- |
| `currentRoute`         | `string`             | The current route path.                                   |
| `sectionName`          | `string`             | The name of the current section (e.g., 'posts', 'pages'). |
| `site`                 | `object`             | The selected site object.                                 |
| `currentUser`          | `object`             | The current user object.                                  |
| `handleClose`          | `() => void`         | Callback to handle closing the agent.                     |
| `toolProvider`         | `ToolProvider`       | Provider for custom tools/abilities.                      |
| `contextProvider`      | `ContextProvider`    | Provider for environment-specific context.                |
| `emptyViewSuggestions` | `Suggestion[]`       | Custom suggestions for the empty view.                    |
| `markdownComponents`   | `MarkdownComponents` | Custom markdown renderers.                                |
| `markdownExtensions`   | `MarkdownExtensions` | Custom markdown extensions.                               |

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
