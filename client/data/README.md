# Data

This directory contains hooks and high-order components related to data fetching. Folders within this directory refer to certain areas of the data that powers Calypso as an application.

Behind the abstraction, they are using `react-query` as the way to query and mutate data from the back-end.

## Persistence

Query results are persisted by default because `react-query` is typically used to fetch and render server-side data. In `redux`, on the other hand, we require folks to opt-in to persistence because `redux` is often used for client-side UI state, which is typically not intended to be persisted.

Persistence opt-out when using `react-query` is necessary in some cases. You can achieve that in two ways:

- Simple opt-out, where you pass a boolean to the `persist` property:

```js
function MyComponent() {
	useQuery( queryKey, fetchFn, {
		meta: {
			persist: false,
		},
	} );

	return null;
}
```

- Smart opt-out, where you can pass a callback to decide whether or not to persist the query based on its data. Example:

```ts
function MyComponent() {
	useQuery( queryKey, fetchFn, {
		meta: {
			persist: ( data: Theme[] ) => data.length > 0,
		},
	} );

	return null;
}
```

Persistence is disabled for queries that didn't succeed, regardless of the value defined in the `persist` property. Mutation results are not persisted.
