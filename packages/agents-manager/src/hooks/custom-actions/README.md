# Custom Actions

> **Warning:** Cross-bundle bridge. Actions live on `window.__agentsManagerActions` — don't expose anything sensitive.

This folder publishes `window.__agentsManagerActions` so code outside the React tree (other bundles, external scripts) can drive the Agents Manager.

| Hook                       | Role                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `useSetupCustomActions`    | Mounted with the agent dock. Registers the built-in actions and fires `agents-manager-ready`.      |
| `useRegisterCustomActions` | Lets any component publish its own actions onto the global. Used internally; also for new actions. |

Consuming the API? See [Public API](#public-api). Adding a new action? See [Adding a new action](#adding-a-new-action).

## Public API

| Method                     | Signature                                               | Description                                                                                                          |
| -------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `getChatState`             | `() => Promise<{ isOpen, isDocked, floatingPosition }>` | Current chat state. Waits for the store to load before resolving.                                                    |
| `getSessionId`             | `() => string`                                          | Active session ID.                                                                                                   |
| `getTabId`                 | `() => string`                                          | The `tab_id` on the chat's Tracks events, so host events can join on it.                                             |
| `getTurnId`                | `() => string`                                          | The current `turn_id` (the last send's), or `''` before the first send.                                              |
| `getAgentBlockId`          | `(clientId: string) => string`                          | The id the agent knows a block by, so a host can name the block to it.                                               |
| `recordBigSkyTracksEvent`  | `(eventName: BigSkyEventName, props?) => void`          | Record a full `jetpack_big_sky_*` event name with family base props.                                                 |
| `isChatVisible`            | `() => boolean`                                         | Whether the chat is visible (open and not minimized).                                                                |
| `setChatOpen`              | `(isOpen: boolean) => void`                             | Open or close the chat (closing is ignored when non-dismissible). Opening also expands it from the minimized bar.    |
| `setChatDocked`            | `(isDocked: boolean) => void`                           | Dock or undock the chat.                                                                                             |
| `setChatEnabled`           | `(isEnabled: boolean) => void`                          | Enable the chat, or disable its input while leaving the chat visible.                                                |
| `setChatCompactMode`       | `(isCompact: boolean) => void`                          | Toggle compact mode (undocked only).                                                                                 |
| `setChatDesktopMediaQuery` | `(query: string) => void`                               | Media query used to decide whether the chat can dock into the sidebar.                                               |
| `setChatInput` \*          | `(value: string) => void`                               | Set the chat input value and focus it.                                                                               |
| `submitChatMessage` \*     | `(message?: string) => Promise<void>`                   | Submit a message programmatically. If omitted, submits the current input.                                            |
| `setContextEntry`          | `(entry) => void`                                       | Add or replace a context entry: sent with the next message, or kept with `delivery: 'conversation'`.                 |
| `removeContextEntry`       | `(id: string) => void`                                  | Remove a context entry. Linked cards (`contextEntryIds`) are removed too.                                            |
| `setContextCard`           | `(card) => void`                                        | Add or replace a card shown inside the chat.                                                                         |
| `removeContextCard`        | `(id: string) => void`                                  | Remove a card.                                                                                                       |
| `setSiteEditorAction`      | `(name, value) => void`                                 | Record a Site Editor action (name → value) for the chat to read.                                                     |
| `chatNavigate`             | `NavigateFunction`                                      | The `react-router-dom` navigate function (path with options, or delta).                                              |
| `resumeChat`               | `() => void`                                            | Switch the chat back to this tab's conversation (not a new one). Doesn't open it: follow with `setChatOpen( true )`. |
| `isReady`                  | `boolean`                                               | `true` once the API is fully populated and safe to call.                                                             |

\* Registered by `OrchestratorChat`, so available only while the chat screen is mounted — not on History or other screens, nor while the chat is closed on hosts with an AI chat entry button. Always optional-chain these calls — they can be `undefined` even after `isReady` is `true`.

`getTabId`, `getTurnId`, `getAgentBlockId` and `recordBigSkyTracksEvent` are absent on older Agents Manager bundles — optional-chain them too.
`BigSkyEventName` is `` `jetpack_big_sky_${ string }` `` — the full prefix is required. The bare prefix alone, or any non-conforming name, is dropped without recording.
Chat and feedback events (message send, suggestions, responses, thumbs) are also recorded as `calypso_agents_manager_<same suffix>` with the shared properties; other names are recorded under the Big Sky name only.

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

## Conversation activity

`agents-manager-conversation-changed` fires on `window` when the chat mounts with messages and whenever the transcript's message count changes to a non-zero value — a message is sent, received or added mid-turn, or a conversation of a different length is shown. It doesn't fire when the transcript is cleared or for a switch to a conversation of the same length, and it doesn't mark the end of a turn; use `agents-manager-turn-ended` for that. Use it to re-sync state a host bundle renders inside the chat transcript (e.g. a card reflecting an action run from chat) without a page reload. The event carries no detail; read whatever you need from your own state or the API when it fires.

```js
function resync() {
	// re-fetch / re-render whatever the chat may have changed
}

window.addEventListener( 'agents-manager-conversation-changed', resync );
```

Dispatched by `OrchestratorChat` as the transcript changes. Prefer this over the provider contract for chat interactions — providers are reserved for agent setup.

## Chat opened and closed

Two window events say when the chat comes into view and when it is closed, for hosts that react to how the user uses the chat (e.g. pointing at the entry button after their first close). Minimizing is not a close: it hides the chat but leaves it open, and expanding it again is an open.

| Event                        | `detail`                                 | Fires when                                                                               |
| ---------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------- |
| `agents-manager-chat-opened` | `{ restored: boolean, trigger: string }` | The chat came into view: opened, expanded from minimized, or restored open on page load. |
| `agents-manager-chat-closed` | `{ trigger: string }`                    | The chat was closed.                                                                     |

`trigger` says who asked: `host` for `setChatOpen` through this API, `restored` for a chat already open when the page loaded, and `user` for everything else — the entry buttons, the chat's own controls. A failed load never renders the dock, so neither event fires.

```js
window.addEventListener( 'agents-manager-chat-closed', ( event ) => {
	if ( event.detail.trigger === 'user' ) {
		// the merchant closed it themselves
	}
} );
```

Dispatched by `useChatOpenCloseEvents`, which also records `calypso_agents_manager_chat_opened` and `calypso_agents_manager_chat_closed` in Tracks with the same properties, plus `docked` on the close.

## Agent activity

Three more window events say what the agent is _doing_, for hosts that render their own editing surface around the chat: whether a turn is in flight, and when an ability has finished, so anything it wrote has landed. Big Sky's easy mode, for example, holds its own navigation while the agent works, shows what changed once the turn ends, and follows an ability that moves the editor.

| Event                              | `detail`                        | Fires when                                                                                                                                            |
| ---------------------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `agents-manager-turn-started`      | —                               | A turn began — a message was sent and the agent is working on it.                                                                                     |
| `agents-manager-turn-ended`        | —                               | The turn finished or was aborted.                                                                                                                     |
| `agents-manager-ability-completed` | `{ name: string, ok: boolean }` | An ability ran to completion, after it resolved or threw so anything it wrote has landed. `ok` is `false` when it threw or answered `success: false`. |

The turn events are edges, not state: they fire on the change, so a listener that arrives mid-turn hears nothing until that turn ends. The turn is taken from the agent manager rather than from the chat, which is one route in the dock and can unmount while the stream carries on — a turn that ends while the chat is away has its end announced when the chat comes back, and until then a listener is told the agent is still working.

For example:

```js
window.addEventListener( 'agents-manager-turn-started', () => {
	// the agent is working
} );
window.addEventListener( 'agents-manager-ability-completed', ( event ) => {
	const { name, ok } = event.detail;
} );
```

Defined in `utils/agent-activity-events.ts`.

## Initial values

Pre-set these on `window.__agentsManagerActions` **before** Agents Manager mounts:

| Property            | Type      | Default     | Description                              |
| ------------------- | --------- | ----------- | ---------------------------------------- |
| `isCompactMode`     | `boolean` | `false`     | Initial compact mode state.              |
| `isChatEnabled`     | `boolean` | `true`      | Initial chat enabled state.              |
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
	state: { isNewChat: true },
	replace: true,
} );
window.__agentsManagerActions.chatNavigate( '/history' );

// Reopen the chat, resuming this tab's conversation
window.__agentsManagerActions.resumeChat();
window.__agentsManagerActions.setChatOpen( true );

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

1. Add the field to the `AgentsManagerActions` interface in [`src/global.d.ts`](../../global.d.ts), as optional: hosts can run against an older bundle that doesn't have it. Add it to the optional-chain note under [Public API](#public-api) too.
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
- A `'conversation'` context entry stays until it is removed (`removeContextEntry`, or dismissing a linked card); a `'next-message'` one (the default) is used up by the next send.

## Document-scoped presentation

Hosts can set `window.__agentsManagerConfig.chatPresentation` **before loading
Agents Manager**:

```js
window.__agentsManagerConfig = {
	...window.__agentsManagerConfig,
	chatPresentation: { dismissible: false, showEntryPoints: false },
};
```

Both flags default to `true`. `dismissible: false` keeps the chat expanded even
when the saved preference is closed or minimized, removes Close and Minimize on
all chat routes, and ignores close requests (including `setChatOpen(false)`).
`getChatState().isOpen` and `isChatVisible()` then always report `true`.
`showEntryPoints: false` hides the wp-admin/omnibar and editor toolbar Agent
toggles. Docking and responsive floating layout remain available.

This configuration lasts only for the current document and is not a user
preference. It is a bootstrap contract, not a reactive settings API. The host
must provide an accessible exit from its experience and hide server-rendered
entry controls before first paint if needed. Calypso, Reader and other hosts
that omit the configuration retain their existing behavior.
