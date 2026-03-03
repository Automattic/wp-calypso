# `useSetupCustomActions`

> **Warning:** This is a temporary cross-bundle bridge for the Big Sky migration. Actions are exposed on a global (`window.__agentsManagerActions`), so they must not perform sensitive operations or carry privileged data.

This hook registers a set of actions on `window.__agentsManagerActions` so that code outside the React tree (e.g. an external script or a different bundle) can interact with the Agents Manager.

## API

Once the hook is mounted, `window.__agentsManagerActions` provides:

| Method                       | Signature                                                  | Description                                                                                      |
| ---------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `getChatState`               | `() => Promise<{ isOpen, isDocked, floatingPosition }>`    | Returns the current chat state. Waits for the store to load before resolving.                    |
| `setChatOpen`                | `(isOpen: boolean) => void`                                | Opens or closes the chat.                                                                        |
| `setChatDocked`              | `(isDocked: boolean) => void`                              | Docks or undocks the chat.                                                                       |
| `setChatEnabled`             | `(isEnabled: boolean) => void`                             | Enables or disables chat rendering.                                                              |
| `setChatCompactMode`         | `(isCompact: boolean) => void`                             | Toggles compact mode (undocked only).                                                            |
| `setChatDesktopMediaQuery`   | `(query: string) => void`                                  | Sets the media query used to determine whether the chat can dock into the sidebar.               |
| `chatNavigate`               | `NavigateFunction`                                         | The `react-router-dom` navigate function. Accepts a path string with options or a numeric delta. |

### Initial values

Properties can be pre-set on `window.__agentsManagerActions` **before** the hook mounts to control initial state:

| Property              | Type                  | Default     | Description                                  |
| --------------------- | --------------------- | ----------- | -------------------------------------------- |
| `isCompactMode`       | `boolean`             | `false`     | Initial compact mode state.                  |
| `isChatEnabled`       | `boolean`             | `true`      | Initial chat rendering state.                |
| `desktopMediaQuery`   | `string`              | `undefined` | Initial media query for sidebar docking.     |

## Examples

```js
// Get current state (resolves once the store has loaded)
const state = await window.__agentsManagerActions.getChatState();
console.log( state );

// Open the chat
window.__agentsManagerActions.setChatOpen( true );

// Navigate to a chat session
window.__agentsManagerActions.chatNavigate( '/chat', { state: { sessionId: '123' }, replace: true } );

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

// Pre-set initial values before mount
window.__agentsManagerActions = {
	...window.__agentsManagerActions,
	isCompactMode: true,
	isChatEnabled: false,
	desktopMediaQuery: '(min-width: 1200px)',
};
```
