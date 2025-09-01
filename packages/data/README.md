# Data

Data layer for the Automattic ecosystem.

This package is the bridge between consumers and the WordPress.com REST API, providing its data fetching functions, as well as their argument and return types. It exists as a way to centralize data fetching logic and type definitions, and to avoid duplicating code across clients.

Each resource is mapped to a folder, and each folder follows the following structure:

```
src/
  - <resource-name>/
    - fetchers.ts
    - types.ts
    - index.ts
```

Each resource folder contains:

- `fetchers.ts`: The function (or functions) that fetches the data from the WordPress.com REST API.
- `types.ts`: The types for the resource.
- `index.ts`: A barrel file to better control what entities get exported.

## Consuming

Simply import the desired resource function or type from the package. Example:

```ts
import { fetchDomainSuggestions, type DomainSuggestion } from '@automattic/data';
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

To add a new resource, create a new folder in the `src` directory and follow the structure described above. Don't forget to add the resource barrel file to the `src/index.ts` file.

Do not add any new dependencies to this package before consulting with the Architecture team on Slack.
