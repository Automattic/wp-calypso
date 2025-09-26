# API Core

The API core definition for the Automattic ecosystem.

This package is the bridge between consumers and the REST APIs used throughout Automattic products, providing its data fetching functions, as well as their arguments and return types. It exists as a way to centralize data fetching logic and type definitions, and to avoid duplicating code across clients.

Each resource is mapped to a folder, and each folder follows the following structure:

```
src/
  - <resource-name>/
    - fetchers.ts
    - mutators.ts
    - types.ts
    - index.ts
```

Each resource folder contains:

- `fetchers.ts`: Functions that fetch data from the WordPress.com REST API.
- `mutators.ts`: Functions that modify data via the WordPress.com REST API.
- `types.ts`: Type definitions for the resource.
- `index.ts`: A barrel file to better control what entities get exported. This is to avoid having to import from multiple files.

## Consuming

Simply import the desired resource function or type from the package. Example:

```ts
import { fetchDomainSuggestions, type DomainSuggestion } from '@automattic/api-core';
```

Then call it with the appropriate arguments. Example:

```ts
const domainSuggestions = await fetchDomainSuggestions( 'example search' );
```

Alternatively, you can use the `useQuery` hook from `@tanstack/react-query` to fetch the data. Example:

```tsx
function MyComponent() {
	const { data: domainSuggestions } = useQuery( {
		queryKey: [ 'domain-suggestions', query ],
		queryFn: () => fetchDomainSuggestions( query ),
	} );

	return null;
}
```

## Contributing

These guidelines should be followed to ensure consistency across the package.

### File structure

- To add a new resource, create a new directory in the `src` directory and follow the structure described above. Don't forget to add the resource barrel file to the `src/index.ts` file.
- The directory name should match the actual endpoint path as closely as possible.
  - For example, `/sites/${ siteId }/domains` would go in a directory called `site-domains`.
- We can group related endpoints that share the same path prefix in the same directory.
  - For example, both `/sites/${ siteId }/domains` and `/sites/${ siteId }/domains/primary` could belong in the same `site-domains` directory.
- Please follow the above rules as strictly as possible.
  - Try to only add exceptions if you think it's justified. For example, endpoints under `/devices/*` are currently placed in a directory called `notification-devices` because otherwise it's not clear that they are related to notifications.

### Adding new fetchers or mutators

- Add GET endpoints as fetchers to `fetchers.ts`.
- Add non-GET endpoints as mutators to `mutators.ts`.
- Functions must be asynchronous and return a `Promise`.
- Use verbs in function names.
  - For consistency, use `fetch` prefix for fetcher function names.
  - Use verbs like `create`, `update`, `delete`, `add`, `remove`, etc. for mutator function name prefixes.
- Functions should return the endpoint response in the rawest form possible.
- Minimal transformations are allowed if they improve developer experience. Examples (return values must still be wrapped in a `Promise`):
  - If the response is always `{ success: true }` (when the endpoint succeeds), the function can simply return `void`.
  - If the response is wrapped in an envelope like `{ "data": <actual data> }`, we can return just the inner object.
- If more complex transformations are needed, consider making those transformations directly on the backend side.

### Adding type definitions

- Add type definitions for request parameters and response data to `types.ts`.
- For consistency, prefer `T[]` over `Array< T >`.
