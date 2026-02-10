# `useSetupCustomActions`

> **Warning:** This is a temporary cross-bundle bridge for the Big Sky migration. Actions are exposed on a global (`window.__agentsManagerActions`), so they must not perform sensitive operations or carry privileged data.

This hook registers a set of actions on `window.__agentsManagerActions` so that code outside the React tree (e.g. an external script or a different bundle) can interact with the Agents Manager.

## API

Once the hook is mounted, `window.__agentsManagerActions` provides:

| Method                | Signature                                                  | Description                                                                                      |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `getChatState`        | `() => Promise<{ isOpen, isDocked, floatingPosition }>`    | Returns the current chat state. Waits for the store to load before resolving.                    |
| `setChatOpen`         | `(isOpen: boolean) => void`                                | Opens or closes the chat.                                                                        |
| `setChatDocked`       | `(isDocked: boolean) => void`                              | Docks or undocks the chat.                                                                       |
| `setChatEnabled`      | `(isEnabled: boolean) => void`                             | Enables or disables chat rendering.                                                              |
| `setChatCompactMode`  | `(isCompact: boolean) => void`                             | Toggles compact mode (undocked only).                                                            |
| `chatNavigate`        | `NavigateFunction`                                         | The `react-router-dom` navigate function. Accepts a path string with options or a numeric delta. |

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
```
