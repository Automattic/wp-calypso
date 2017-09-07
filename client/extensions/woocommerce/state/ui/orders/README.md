UI Orders
=========

This module is used to manage state for the UI of the orders sections. This includes which filters are in effect for the list view, and tracking any edits or new orders.

## Actions

### `updateCurrentOrdersQuery( siteId: number, query: object )`

Update the query used to display the orders list - ex: set the search term, or change which page is being viewed.

### `editOrder( siteId: number, order: object )`

Track edits made to an order, or content added to a new order.

### `clearOrder( siteId: number )`

Clear the current order edit-tracking.

## Reducer

This is saved on a per-site basis. 

```js
{
	"orders": {
		[ siteId ] : {
			edits: {
				currentlyEditingId: {},
				changes: {
					... order data ...
				},
			},
			list: {
				currentPage: 1,
				currentSearch: "Smith",
			},
		}
	}
}
```

## Selectors

### `getOrdersCurrentPage( state, [siteId] )`

Gets the current page being shown to the user. Defaults to 1.

### `getOrdersCurrentSearch( state, [siteId] )`

Gets the current search term being shown to the user. Defaults to "".
