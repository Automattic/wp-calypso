# Data

This directory contains hooks and Higher-Order Components (HOCs) related to data fetching and manipulation. Folders within this directory refer to certain areas of the data that powers Calypso as an application.

Behind the abstraction, they are using `@tanstack/react-query` (generally referred to as **React Query** or **RQ**) as the way to query and mutate data from the backend.

Please note, we're currently working on expanding this document to contain all our Calypso-specific conventions and recommendations. In the meantime, please make yourself familiar with the [official documentation](https://tanstack.com/query/v4/docs/react/overview). There's also great [community resources](https://tkdodo.eu/blog/practical-react-query) to learn more about React Query.

## Persistence

Query results are persisted by default because React Query is typically used to fetch and render server-side data. In `redux`, on the other hand, we require folks to opt-in to persistence because `redux` is often used for client-side UI state, which is typically not intended to be persisted.

Persistence opt-out when using React Query is necessary in some cases. You can achieve that in two ways:

- Simple opt-out, where you pass a boolean to the `persist` property:

```js
function MyComponent() {
	useQuery( {
		queryKey,
		queryFn,
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
	useQuery( {
		queryKey,
		queryFn,
		meta: {
			persist: ( data: Theme[] ) => data.length > 0,
		},
	} );

	return null;
}
```

Persistence is disabled for queries that didn't succeed, regardless of the value defined in the `persist` property. Mutation results are not persisted.
