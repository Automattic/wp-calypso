# `useSetupCustomActions`

> **Warning:** This is a temporary cross-bundle bridge for the Big Sky migration. Actions are exposed on a global (`window.__agentsManagerActions`), so they must not perform sensitive operations or carry privileged data.

This hook registers a set of actions on `window.__agentsManagerActions` so that code outside the React tree (e.g. an external script or a different bundle) can interact with the Agents Manager.

## API

Once the hook is mounted, `window.__agentsManagerActions` provides:

| Method                     | Signature                                               | Description                                                                                      |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `getChatState`             | `() => Promise<{ isOpen, isDocked, floatingPosition }>` | Returns the current chat state. Waits for the store to load before resolving.                    |
| `getSessionId`             | `() => string`                                          | Returns the active session ID for the current conversation.                                      |
| `setChatOpen`              | `(isOpen: boolean) => void`                             | Opens or closes the chat.                                                                        |
| `setChatDocked`            | `(isDocked: boolean) => void`                           | Docks or undocks the chat.                                                                       |
| `setChatEnabled`           | `(isEnabled: boolean) => void`                          | Enables or disables chat rendering.                                                              |
| `setChatCompactMode`       | `(isCompact: boolean) => void`                          | Toggles compact mode (undocked only).                                                            |
| `setChatDesktopMediaQuery` | `(query: string) => void`                               | Sets the media query used to determine whether the chat can dock into the sidebar.               |
| `setChatInput`             | `(value: string) => void`                               | Sets the current chat input value and focuses the input.                                         |
| `submitChatMessage`        | `(message?: string) => Promise<void>`                   | Submits a message programmatically. If omitted, submits the current input value.                 |
| `setContextEntry`          | `(entry: AgentsManagerExternalContextEntry) => void`    | Adds or replaces context that is merged into `clientContext.contextEntries`.                     |
| `removeContextEntry`       | `(id: string) => void`                                  | Removes a context entry. Cards listing this id in `contextEntryIds` are removed too.             |
| `setContextCard`           | `(card: AgentsManagerExternalContextCard) => void`      | Adds or replaces a graphical card shown inside the chat.                                         |
| `removeContextCard`        | `(id: string) => void`                                  | Removes a graphical context card.                                                                |
| `chatNavigate`             | `NavigateFunction`                                      | The `react-router-dom` navigate function. Accepts a path string with options or a numeric delta. |
| `isReady`                  | `boolean`                                               | `true` once the actions API is fully populated and safe to call.                                 |

## Ready signal

Agents Manager dispatches a `agents-manager-ready` event on `window` once the actions API is fully populated. Hosts that need to invoke actions on initial load (e.g. `setChatOpen( true )`) should listen for this event instead of polling.

For hosts that may load **after** Agents Manager has already mounted, check `window.__agentsManagerActions?.isReady` synchronously before subscribing — the event has already fired and won't fire again.

```js
function openChat() {
	window.__agentsManagerActions?.setChatOpen( true );
}

if ( window.__agentsManagerActions?.isReady ) {
	openChat();
} else {
	window.addEventListener( 'agents-manager-ready', openChat, { once: true } );
}
```

### Initial values

Properties can be pre-set on `window.__agentsManagerActions` **before** the hook mounts to control initial state:

| Property            | Type      | Default     | Description                              |
| ------------------- | --------- | ----------- | ---------------------------------------- |
| `isCompactMode`     | `boolean` | `false`     | Initial compact mode state.              |
| `isChatEnabled`     | `boolean` | `true`      | Initial chat rendering state.            |
| `desktopMediaQuery` | `string`  | `undefined` | Initial media query for sidebar docking. |

## Examples

```js
// Get current state (resolves once the store has loaded)
const state = await window.__agentsManagerActions.getChatState();
console.log( state );

// Get active session ID
const sessionId = window.__agentsManagerActions.getSessionId();

// Open the chat
window.__agentsManagerActions.setChatOpen( true );

// Navigate to a chat session
window.__agentsManagerActions.chatNavigate( '/chat', {
	state: { sessionId: '123' },
	replace: true,
} );

// Navigate to conversation history
window.__agentsManagerActions.chatNavigate( '/history' );

// Dock the chat
window.__agentsManagerActions.setChatDocked( true );

// Enable compact mode
window.__agentsManagerActions.setChatCompactMode( true );

// Disable chat rendering
window.__agentsManagerActions.setChatEnabled( false );

// Set desktop media query
window.__agentsManagerActions.setChatDesktopMediaQuery( '(min-width: 1200px)' );

// Attach context that will be sent with the next chat message
window.__agentsManagerActions.setContextEntry( {
	id: 'my-plugin/current-report',
	type: 'my-plugin/report',
	title: 'Current report',
	delivery: 'next-message',
	data: {
		reportId: 123,
		summary: 'Aggregate data only. No customer rows included.',
	},
} );

// Show a matching card in the chat UI. The `body` is publisher-owned
// React; AM only adds the dismiss button and the actions row around it.
window.__agentsManagerActions.setContextCard( {
	id: 'my-plugin/current-report-card',
	contextEntryIds: [ 'my-plugin/current-report' ],
	body: <MyReportCard reportId={ 123 } />,
	actions: [
		{
			label: 'Analyze report',
			type: 'submit',
			prompt: 'Analyze the attached report and recommend next steps.',
		},
	],
} );

// Pre-set initial values before mount
window.__agentsManagerActions = {
	...window.__agentsManagerActions,
	isCompactMode: true,
	isChatEnabled: false,
	desktopMediaQuery: '(min-width: 1200px)',
};
```
