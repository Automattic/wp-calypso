# usePlugins

This hook works as an abstraction to fetch and combine results from wordpress.org and wordpress.com plugin endpoints. It supports category search, maps categories to tags when needed and infinite fetching.

## How to use

```js
import usePlugins from 'calypso/my-sites/plugins/use-plugins';

function Component() {
	const { plugins, isFetching } = usePlugins( {
		category: 'paid',
	} );
}
```

## Hook options

The `usePlugins` hook receives a set of options to be able to configure it's behavior:

- `category`(string): The category which the plugin is filtered with, this category is translated to tags through the `useCategories` hook when supported.
- `search` (string) (optional): A search term to filter plugins through search.
- `infinite` (boolean) (optional): A flag to activate infinite fetching on the dot org plugins, right now infinite search is not supported by dotcom hooks since there is a limited amount of plugins.
- `locale` (string) (optional): The locale that is sent to wporg endpoint.

## Infinite fetching

When passing the `infinite` flag as true, the hook returns a function called `fetchNextPage` which can be used to fetch the next page of results.

```jsx
import usePlugins from 'calypso/my-sites/plugins/use-plugins';

function Component() {
	const { plugins, isFetching, fetchNextPage } = usePlugins( {
		category: 'paid',
	} );

	return (
		<div>
			<Button onClick={ fetchNextPage }> Fetch Next Page </Button>
		</div>
	);
}
```

### Pagination results

The hook returns a `pagination` object which can be used to find the page number currently fetched and the total amount of results. The page represents the dotorg one since dotcom doesn't support infinite fetching yet.

```jsx
import usePlugins from 'calypso/my-sites/plugins/use-plugins';

function Component() {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category: 'paid',
	} );

	return (
		<div>
			<span> { ` page: ${ pagination.page }` } </span>
			<span> { ` results: ${ pagination.results }` } </span>
			<Button onClick={ fetchNextPage }> Fetch Next Page </Button>
		</div>
	);
}
```
