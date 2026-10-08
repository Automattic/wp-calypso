# @automattic/agents-manager

AI agent manager for WordPress and Calypso.

## Installation

An internal workspace package, not published to npm — add `@automattic/agents-manager` as a dependency in the consuming `wp-calypso` workspace (used by Calypso and `apps/agents-manager`).

## Usage

### Basic Integration

The main component is `AgentsManager`. It handles agent initialization, session management, and UI rendering.

```tsx
import AgentsManager from '@automattic/agents-manager';

function MyApp() {
	const site = { ID: 456, URL: 'https://example.com' };

	return (
		<AgentsManager
			sectionName="dashboard"
			site={ site }
			currentSiteId={ site.ID }
			currentRoute="/dashboard"
		/>
	);
}
```

### External Provider Extensions

Custom tools, context providers, suggestions, and markdown extensions are loaded automatically from external plugins via the `loadExternalProviders()` utility. Plugins can register their providers by implementing the extension API.

See `src/extension-types.ts` for the full API documentation on creating custom:

- **Tool Providers**: Register custom abilities the agent can execute
- **Context Providers**: Provide environment-specific context to the agent
- **Suggestions**: Custom suggestions shown in the empty chat view
- **Markdown Components/Extensions**: Custom rendering for agent responses

### A2UI Forms

A2UI `v0.9` response arrays load the SDK renderer on demand. The client identifies these arrays by the first message's version and passes their contents directly to the SDK, trusting the server's payload structure. Agenttic exposes completed messages in canonical history order. The hook applies each new message once; replacing or truncating history replays it in a fresh runtime. Ordinary chat rerenders and streamed appends preserve unsent form input. Restoring forms after a reload requires server history to retain their A2UI operations, including intermediate responses.

The SDK owns `createSurface`, `updateComponents`, `updateDataModel`, and `deleteSurface` semantics, including errors for duplicate creates and updates to unknown surfaces. A surface appears at its creation message. Each applied batch notifies renderer subscribers and publishes a new presentation so transcript memoization displays appended surfaces immediately. The renderer uses that notification for surface lookup, root readiness, and error recovery. Deleting a surface removes its controls; recreating the ID places the new surface at the new message.

The transcript displays surfaces instead of response JSON. Button actions are sent unchanged as `{ version: 'v0.9', action }` in an authenticated `action/execute` request. The backend executes the named server ability directly, without another model call. Failed actions display an error on the originating surface and never fall back to chat submission. Notices use WordPress notice text colors, with a readable fallback for older WordPress controls in dark chat. Every outbound chat message includes the SDK's `a2uiClientDataModel` transport metadata for surfaces requesting `sendDataModel`. Controls are disabled while the agent is processing or an action is executing.

The renderer uses the SDK's standard basic catalog and schemas, with WordPress presentations for `TextField` and `Button`. Text fields retain local edits when an update leaves their value definition unchanged; a changed literal value replaces the edit. Invalid validation patterns show a field error without crashing the surface, and corrected patterns clear the error. Field help inherits the chat's text color to stay readable in dark chat. A surface that encounters another rendering error retries after the next protocol update. Other basic components and functions retain their SDK implementations. Renderer code lives under `src/a2ui`.

Run package tests with `yarn jest -c packages/agents-manager/jest.config.js --runInBand`. The package Jest configuration transforms the SDK's ESM dependencies.

The backend must supply a component with ID `root` and component definitions for button children. While the root component is pending, the form displays a WordPress SVG spinner instead of the SDK's `[Loading root...]` placeholder. The SDK handles progressive rendering once the root arrives; no missing roots or literal button labels are inferred.

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

See `src/hooks/custom-actions/README.md` for details.

### URL Parameters

The host page URL can carry these query parameters:

| Parameter       | Description                                                                                                                                                                              |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ai-open`       | `ai-open=true` auto-opens the chat (docked or undocked) on page load, e.g. for links from emails. The parameter is stripped from the URL after being applied.                            |
| `agent`         | Overrides the agent ID, for testing (e.g., `?agent=wpcom-workflow-support_chat`).                                                                                                        |
| `version`       | Overrides the agent version, for testing (e.g., `?version=1.0.25`).                                                                                                                      |
| `wp-agent-chat` | The chat session to resume, handed off by a same-tab link from another origin (e.g. wp-admin to Calypso) so the conversation continues there. Stripped from the URL after being applied. |
| `wp-agent-site` | The site scope of the handed-off session. The session is resumed only on pages for that site, and stored for it otherwise.                                                               |

## API Reference

### AgentsManager Props

| Prop                             | Type                           | Description                                                                                                              |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| `sectionName`                    | `string`                       | The name of the current section (e.g., 'wp-admin', 'gutenberg').                                                         |
| `currentUser`                    | `CurrentUser` (optional)       | Current user (from `@automattic/data-stores`). Sets `isLoggedIn`.                                                        |
| `site`                           | `AgentsManagerSite` (optional) | The selected site object (from `@automattic/data-stores`).                                                               |
| `currentRoute`                   | `string` (optional)            | The current route path.                                                                                                  |
| `currentSiteId`                  | `number` (optional)            | The ID of the selected site. When set, chat state is scoped to this site. When omitted, uses a shared "no-site" context. |
| `agentId`                        | `string` (optional)            | Explicit agent ID supplied by the host.                                                                                  |
| `zendeskConversationTags`        | `string[]` (optional)          | Zendesk conversation tags to apply when a new support conversation is created.                                           |
| `zendeskSmoochIntegrationKey`    | `string` (optional)            | Index selecting a dedicated Smooch integration for new support conversations (e.g. `woo`).                               |
| `zendeskTicketProductFieldValue` | `string` (optional)            | Zendesk Product ticket-field value to apply to new support conversations.                                                |

### Exported Hooks and Utilities

Feedback utilities are also exported: `useFeedbackAction`, `submitFeedback`, `rateMessage`, and the `FeedbackInput` component. Chat UI actions (`openAgentsManagerChat`, `closeAgentsManagerChat`, `isAgentsManagerChatVisible`, `getAgentsManagerChatRoute`) and `recordAgentsManagerTracksEvent` are exported as well. A host rendering its own AI chat entry button reads `useAiChatEntryState()` for `isChatVisible` and wraps its label text in `<AiChatEntryLabel>`, which shows it only while the chat is hidden.

Hosts that own a dedicated AI experience can set the [document-scoped presentation configuration](src/hooks/custom-actions/README.md#document-scoped-presentation) before loading Agents Manager to keep chat open and hide wp-admin/editor entry toggles. Chat state APIs report the effective open state, and close requests are ignored while `dismissible` is `false`.

### Exported Types

```tsx
import type {
	AgentsManagerProps,
	Ability,
	ToolProvider,
	ContextProvider,
	ClientContextType,
	BaseContextEntry,
	ContextEntry,
	Suggestion,
	UseFeedbackActionConfig,
	UseFeedbackActionReturn,
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

`Ability` is re-exported from `@wordpress/abilities`, which owns the authoritative shape (`name`, `label`, `description`, `category`, schemas, callbacks, and `meta`):

```tsx
import type { Ability } from '@automattic/agents-manager';
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
	environment: 'wp-admin' | 'calypso' | string; // full union in `src/extension-types.ts`
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
