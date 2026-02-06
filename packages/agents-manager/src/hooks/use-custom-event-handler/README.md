# `useCustomEventHandler` (custom event bridge)

`useCustomEventHandler` listens for a browser `CustomEvent` named `agents-manager:action` and translates it into state updates, navigation, or other actions on the Agents Manager UI.

This is useful when you want to control the Agents Manager UI from code that *doesn't* have direct access to the React component tree or the data store (for example: an external script, or a different bundle).

## Event name

- **Type:** `CustomEvent`
- **Name:** `agents-manager:action`
- **Target:** `window`

## Event detail contract

The event is expected to have a `detail` object with:

- `type`: one of the action strings below
- `payload`: action-specific data (validated at runtime)

### Supported actions

#### `NAVIGATE`

Navigate to a local path.

- **payload**: object
  - `path` (**required**): `string` starting with `/`
  - `replace` (optional): `boolean` (defaults to `false`)

#### `SET_CHAT_OPEN`

Open or close the chat UI.

- **payload**: `boolean`

#### `SET_CHAT_DOCKED`

Dock or undock the chat UI.

- **payload**: `boolean`

#### `SET_CHAT_COMPACT_MODE`

Toggle compact mode for the floating chat UI (undocked mode).

- **payload**: `boolean`

#### `SET_CHAT_ENABLED`

Enable or disable rendering of the chat UI.

- **payload**: `boolean`

#### `GET_CHAT_STATE`

Request the current state of the chat. This dispatches a `agents-manager:state` event with the current state.

- **payload**: none

**Use cases:**

1. **Check initial state** - Get the current state when your app loads.
   ```js
   window.addEventListener( 'agents-manager:state', ( event ) => {
     console.log( 'Chat is open:', event.detail.isOpen );
     console.log( 'Chat is docked:', event.detail.isDocked );
   }, { once: true } );

   window.dispatchEvent(
     new CustomEvent( 'agents-manager:action', {
       detail: { type: 'GET_CHAT_STATE' }
     } )
   );
   ```

2. **Conditional actions** - Check state before performing an action.
   ```js
   // Only open chat if it's not already open
   window.addEventListener( 'agents-manager:state', ( event ) => {
     if ( ! event.detail.isOpen ) {
       window.dispatchEvent(
         new CustomEvent( 'agents-manager:action', {
           detail: { type: 'SET_CHAT_OPEN', payload: true }
         } )
       );
     }
   }, { once: true } );

   window.dispatchEvent(
     new CustomEvent( 'agents-manager:action', {
       detail: { type: 'GET_CHAT_STATE' }
     } )
   );
   ```

3. **UI coordination** - Adjust other UI elements based on chat state.
   ```js
   // Update AI button appearance when chat opens/closes
   window.addEventListener( 'agents-manager:state', ( event ) => {
     const aiButton = document.getElementById( 'ai-assistant-button' );
     if ( event.detail.isOpen ) {
       aiButton.classList.add( 'active' );
       aiButton.setAttribute( 'aria-expanded', 'true' );
     } else {
       aiButton.classList.remove( 'active' );
       aiButton.setAttribute( 'aria-expanded', 'false' );
     }
   }, { once: true } );

   window.dispatchEvent(
     new CustomEvent( 'agents-manager:action', {
       detail: { type: 'GET_CHAT_STATE' }
     } )
   );
   ```

## Response events

### `agents-manager:state`

The hook dispatches this event in response to `GET_CHAT_STATE` or automatically once when the state is loaded (after API data has been fetched).

- **Event name:** `agents-manager:state`
- **Event detail:**
  - `isOpen`: `boolean` - Whether the chat is open
  - `isDocked`: `boolean` - Whether the chat is docked

**Example listener:**

```js
window.addEventListener( 'agents-manager:state', ( event ) => {
	console.log( 'Chat state:', event.detail );
	// { isOpen: true, isDocked: false }
} );
```

## Examples

### Dispatch a navigation action

```js
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: {
			type: 'NAVIGATE',
			payload: { path: '/history', replace: false },
		},
	} )
);
```

### Open and close chat

```js
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_OPEN', payload: true },
	} )
);

window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_OPEN', payload: false },
	} )
);
```

### Dock and undock

```js
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_DOCKED', payload: true },
	} )
);

window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_DOCKED', payload: false },
	} )
);
```

### Set compact mode

```js
// Enable compact mode
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_COMPACT_MODE', payload: true },
	} )
);

// Disable compact mode
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_COMPACT_MODE', payload: false },
	} )
);
```

### Enable or disable chat

```js
// Disable chat rendering
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_ENABLED', payload: false },
	} )
);

// Enable chat rendering
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'SET_CHAT_ENABLED', payload: true },
	} )
);
```

### Request current state

```js
// Request the current state
window.dispatchEvent(
	new CustomEvent( 'agents-manager:action', {
		detail: { type: 'GET_CHAT_STATE' },
	} )
);

// Listen for the state response
window.addEventListener( 'agents-manager:state', ( event ) => {
	console.log( 'Current state:', event.detail );
} );
```
