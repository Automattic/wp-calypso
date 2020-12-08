# UI Orders

This module is used to manage state for the UI of the orders sections. This includes which filters are in effect for the list view, and tracking any edits or new orders. Newly created orders get placeholder IDs in the format `{ placeholder: 'order_1' }`. The current structure only tracks editing one order per site.

## Actions

### `updateCurrentOrdersQuery( siteId: number, query: object )`

Update the query used to display the orders list - ex: set the search term, or change which page is being viewed.

### `editOrder( siteId: number, order: object )`

Track edits made to an order, or content added to a new order.

### `clearOrderEdits( siteId: number )`

Clear the current order edit-tracking.

## Reducer

This is saved on a per-site basis.

```js
const object = {
	orders: {
		[ siteId ]: {
			edits: {
				currentlyEditingId: {},
				changes: {
					/*... order data ...*/
				},
			},
			list: {
				currentPage: 1,
				currentSearch: 'Smith',
			},
		},
	},
};
```

## Selectors

### `getCurrentlyEditingOrderId = ( state, [siteId] )`

Gets the ID of the current order, or object placeholder, if a new order. Defaults to null, if no order is being edited.

### `getOrdersCurrentPage( state, [siteId] )`

Gets the current page being shown to the user. Defaults to 1.

### `getOrdersCurrentSearch( state, [siteId] )`

Gets the current search term being shown to the user. Defaults to "".

### `getOrderEdits( state, [siteId] )`

Gets the local edits made to the current order. Defaults to {} if no order is being edited.

### `getOrderWithEdits( state, [siteId] )`

Merges the existing order with the local changes, or just the "changes" if a newly created order. Defaults to {} if no order is being edited.

### `isCurrentlyEditingOrder( state, [siteId] )`

Whether the given site (or current site) has changes pending for an order (or new order).
