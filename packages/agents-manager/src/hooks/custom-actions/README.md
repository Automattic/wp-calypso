# Custom Actions

> **Warning:** Cross-bundle bridge for the Big Sky migration. Actions live on `window.__agentsManagerActions` — don't expose anything sensitive.

This folder publishes `window.__agentsManagerActions` so code outside the React tree (other bundles, external scripts) can drive the Agents Manager.

| Hook                       | Role                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `useSetupCustomActions`    | Mounted with the agent dock. Registers the built-in actions and fires `agents-manager-ready`.      |
| `useRegisterCustomActions` | Lets any component publish its own actions onto the global. Used internally; also for new actions. |

Consuming the API? See [Public API](#public-api). Adding a new action? See [Adding a new action](#adding-a-new-action).

## Public API

| Method                     | Signature                                               | Description                                                               |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| `getChatState`             | `() => Promise<{ isOpen, isDocked, floatingPosition }>` | Current chat state. Waits for the store to load before resolving.         |
| `getSessionId`             | `() => string`                                          | Active session ID.                                                        |
| `isChatVisible`            | `() => boolean`                                         | Whether the chat is visible (open and not minimized).                     |
| `getCurrentRoute`          | `() => string`                                          | The chat's current route, e.g. `/chat`, `/history`, `/support-guides`.    |
| `setChatOpen`              | `(isOpen: boolean) => void`                             | Open or close the chat. Opening also expands it from the minimized bar.   |
| `setChatDocked`            | `(isDocked: boolean) => void`                           | Dock or undock the chat.                                                  |
| `setChatEnabled`           | `(isEnabled: boolean) => void`                          | Enable or disable chat rendering.                                         |
| `setChatCompactMode`       | `(isCompact: boolean) => void`                          | Toggle compact mode (undocked only).                                      |
| `setChatDesktopMediaQuery` | `(query: string) => void`                               | Media query used to decide whether the chat can dock into the sidebar.    |
| `setChatInput` \*          | `(value: string) => void`                               | Set the chat input value and focus it.                                    |
| `submitChatMessage` \*     | `(message?: string) => Promise<void>`                   | Submit a message programmatically. If omitted, submits the current input. |
| `setContextEntry`          | `(entry) => void`                                       | Add or replace a context entry sent with the next chat message.           |
| `removeContextEntry`       | `(id: string) => void`                                  | Remove a context entry. Linked cards (`contextEntryIds`) are removed too. |
| `setContextCard`           | `(card) => void`                                        | Add or replace a card shown inside the chat.                              |
| `removeContextCard`        | `(id: string) => void`                                  | Remove a card.                                                            |
| `setSiteEditorAction`      | `(name, value) => void`                                 | Record a Site Editor action (name → value) for the chat to read.          |
| `chatNavigate`             | `NavigateFunction`                                      | The `react-router-dom` navigate function (path with options, or delta).   |
| `resumeChat`               | `() => void`                                            | Reopen the chat, resuming the active conversation (not a new one).        |
| `isReady`                  | `boolean`                                               | `true` once the API is fully populated and safe to call.                  |

\* Available only while the chat panel is mounted. Always optional-chain these calls — they can be `undefined` even after `isReady` is `true`.

## Ready signal

`agents-manager-ready` fires on `window` once the API is populated. Hosts that load **before** Agents Manager should listen for the event; hosts that load **after** should check `isReady` synchronously — the event won't fire again.

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

## Initial values

Pre-set these on `window.__agentsManagerActions` **before** Agents Manager mounts:

| Property            | Type      | Default     | Description                              |
| ------------------- | --------- | ----------- | ---------------------------------------- |
| `isCompactMode`     | `boolean` | `false`     | Initial compact mode state.              |
| `isChatEnabled`     | `boolean` | `true`      | Initial chat rendering state.            |
| `desktopMediaQuery` | `string`  | `undefined` | Initial media query for sidebar docking. |

## Examples

```jsx
// Read state
const state = await window.__agentsManagerActions.getChatState();
const sessionId = window.__agentsManagerActions.getSessionId();

// Drive the chat
window.__agentsManagerActions.setChatOpen( true );
window.__agentsManagerActions.setChatDocked( true );
window.__agentsManagerActions.setChatCompactMode( true );
window.__agentsManagerActions.setChatEnabled( false );
window.__agentsManagerActions.setChatDesktopMediaQuery( '(min-width: 1200px)' );

// Navigate within the chat
window.__agentsManagerActions.chatNavigate( '/chat', {
	state: { sessionId: '123' },
	replace: true,
} );
window.__agentsManagerActions.chatNavigate( '/history' );

// Reopen the chat, resuming the active conversation
window.__agentsManagerActions.resumeChat();

// Attach context to the next chat message
window.__agentsManagerActions.setContextEntry( {
	id: 'my-plugin/current-report',
	type: 'my-plugin/report',
	title: 'Current report',
	delivery: 'next-message',
	data: { reportId: 123 },
} );

// Show a card linked to that entry. `body` is publisher-owned React;
// Agents Manager only adds the dismiss button and the actions row.
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

---

## Adding a new action

1. Add the field to the `AgentsManagerActions` interface in [`src/global.d.ts`](../../global.d.ts).
2. Call `useRegisterCustomActions` from wherever the implementation lives — usually `useSetupCustomActions`, but any component works.
3. Document the new method in the [Public API](#public-api) table above.

### Usage

```tsx
import { useCallback } from '@wordpress/element';
import { useRegisterCustomActions } from '../../hooks/custom-actions';

function MyComponent() {
	const doSomething = useCallback( ( arg: string ) => {
		// ...
	}, [] );

	useRegisterCustomActions( { doSomething } );

	return null;
}
```

### Rules

- **One owner per key.** Two components registering the same key is a bug — the later write wins and silently shadows the earlier one.
- **Stable references (recommended).** Wrap actions in `useCallback` (or hoist them to module scope) so the published functions keep a steady identity. Not required — the hook re-syncs on every commit — but it avoids needless churn and keeps any consumer-cached reference valid.
- **Cleanup is value-aware.** When someone else rewrites your key, your cleanup leaves it alone. This keeps the global consistent across overlapping mounts.

### Caveats

- The global is reachable by any script on the page — don't expose privileged operations or carry secret data.
- External callers should re-read `window.__agentsManagerActions.foo` on each call rather than caching the function — references can change when the owner re-registers.
