# @automattic/agents-manager

Unified AI Agent manager for WordPress and Calypso.

## Installation

```bash
yarn add @automattic/agents-manager
```

## Usage

### Basic Integration

The main component is `AgentsManager`. It handles agent initialization, session management, and UI rendering.

```tsx
import AgentsManager from '@automattic/agents-manager';

function MyApp() {
	const site = { ID: 456, URL: 'https://example.com' };

	return (
		<AgentsManager
			currentRoute="/dashboard"
			sectionName="dashboard"
			site={ site }
		/>
	);
}
```

### Headless Agent Initialization

Use `HeadlessAgentInitializer` when you need to create the agent without rendering the chat UI (e.g., for Image Studio in the Media Library):

```tsx
import { HeadlessAgentInitializer } from '@automattic/agents-manager';

function MyApp() {
	return <HeadlessAgentInitializer site={ site } currentRoute="/media" />;
}
```

### External Provider Extensions

Custom tools, context providers, suggestions, and markdown extensions are loaded automatically from external plugins via the `loadExternalProviders()` utility. Plugins can register their providers by implementing the extension API.

See `src/extension-types.ts` for the full API documentation on creating custom:

- **Tool Providers**: Register custom abilities the agent can execute
- **Context Providers**: Provide environment-specific context to the agent
- **Suggestions**: Custom suggestions shown in the empty chat view
- **Markdown Components/Extensions**: Custom rendering for agent responses

### Using the Store

The package exports a data store for managing the agent's UI state.

```tsx
import { AGENTS_MANAGER_STORE } from '@automattic/agents-manager';
import { useDispatch, useSelect } from '@wordpress/data';

function MyComponent() {
	const { setIsOpen } = useDispatch( AGENTS_MANAGER_STORE );
	const { isOpen } = useSelect( ( select ) =>
		select( AGENTS_MANAGER_STORE ).getAgentsManagerState()
	);

	return <button onClick={ () => setIsOpen( ! isOpen ) }>Toggle Agent</button>;
}
```

### Window API (cross-app integration)

The Agents Manager exposes a `window.__agentsManagerActions` API for controlling the UI from outside the React tree (e.g., from a host app, legacy code, or a separate bundle).

See `src/hooks/use-setup-custom-actions/README.md` for details.

## API Reference

### AgentsManager Props

| Prop           | Type                           | Description                                                        |
| -------------- | ------------------------------ | ------------------------------------------------------------------ |
| `sectionName`  | `string`                       | The name of the current section (e.g., 'wp-admin', 'gutenberg').   |
| `currentUser`  | `CurrentUser` (optional)       | The current user object (from `@automattic/data-stores`).          |
| `site`         | `AgentsManagerSite` (optional) | The selected site object (from `@automattic/data-stores`).         |
| `currentRoute` | `string` (optional)            | The current route path.                                            |
| `handleClose`  | `() => void` (optional)        | Called when the agent is closed.                                   |

### Exported Hooks and Utilities

```tsx
import { useShouldUseUnifiedAgent, getUseUnifiedExperienceFromInlineData } from '@automattic/agents-manager';

function MyComponent() {
	// Check if the unified agent experience is active
	const shouldUseUnifiedAgent = useShouldUseUnifiedAgent();

	// Read the unified experience flag from inline script data (non-hook)
	const useUnifiedExperience = getUseUnifiedExperienceFromInlineData();
}
```

### Exported Types

```tsx
import type {
	AgentsManagerProps,
	HeadlessAgentInitializerProps,
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
