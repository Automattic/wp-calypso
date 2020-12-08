# Order Notes

This module is used to manage order notes on a site.

## Actions

### `fetchNotes( siteId: number, orderId: number, onSuccess: object, onFailure: object )`

Fetch notes from the remote site. Does not run if this order's notes are loading or already loaded.

### `createNote( siteId: number, orderId: number, note: object, onSuccess: object, onFailure: object )`

Create a note for an order on the remote site.

### `onSuccess`, `onFailure`

These parameters should be actions dispatched in the case of success or failure. For example,

```js
const onSuccess = successNotice( translate( 'Note created for order.' ) );
```

## Reducer

This is saved on a per-site basis.

```js
const object = {
	notes: {
		// Keyed by post ID
		isLoading: {
			10: false,
			12: true,
		},
		// Keyed by order ID
		isSaving: {
			10: true,
		},
		// Keyed by order ID
		items: {
			1: {
				id: 1,
				date_created: '2017-03-21T16:46:41',
				note: 'Order ok!!!',
				customer_note: false,
				/*...*/
			},
			2: {
				/*...*/
			},
		},
		orders: {
			10: [ 1, 2, 3 ],
		},
	},
};
```

## Selectors

### `areOrderNotesLoaded( state, orderId: number, [ siteId: number ] )`

Whether the note list for a given order has been successfully loaded from the server. Optional `siteId`, will default to currently selected site.

### `areOrderNotesLoading( state, orderId: number, [ siteId: number ] )`

Whether the note list for a given order is currently being retrieved from the server. Optional `siteId`, will default to currently selected site.

### `getOrderNotes( state, orderId: number, [ siteId: number ] )`

Gets the note list for a given order from the current state, or null if not yet loaded.

### `isOrderNoteSaving( state, orderId: number, [ siteId: number ] )`

Whether we're currently saving a note for a given order on a site. Optional `siteId`, will default to currently selected site.
