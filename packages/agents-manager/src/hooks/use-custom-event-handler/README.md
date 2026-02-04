# `useCustomEventHandler` (custom event bridge)

`useCustomEventHandler` listens for a browser `CustomEvent` named `agents-manager:action` and translates it into state updates (open/docked) or navigation.

This is useful when you want to control the Agents Manager UI from code that *doesn’t* have direct access to the React component tree or the data store (for example: an external script, or a different bundle).

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
