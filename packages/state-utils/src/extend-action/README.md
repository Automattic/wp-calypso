# extendAction( action, data )

Use `extendAction` to leverage the behavior of an existing action creator, extending any dispatched action via the original action creator with the provided data object. By using this helper, you avoid unnecessarily duplicating the original logic or tying the original action creator to your new (presumably optional) requirements. This is the equivalent of calling `Object.assign` on a plain-object action creator result, but also accepts an action thunk for which action objects should be extended.

**Example:**

```js
function original() {
	return ( dispatch ) => {
		dispatch( { type: 'example' } );
		dispatch( { type: 'example' } );
	};
}

function extended() {
	return extendAction( original(), { extended: true } );
}

dispatch( extended() );
// Dispatches two actions `{ type: 'example', extended: true }`
```
