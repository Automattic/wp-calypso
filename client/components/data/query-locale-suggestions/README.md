# Query Locale Suggestions

`<QueryLocaleSuggestions />` is a React component that manages requests to get locale suggestions for the user based on his or her IP/geo-location.

## Usage

Render the component without props. It does not accept any children or render any elements to the page.

```jsx
import QueryLocaleSuggestions from 'calypso/components/data/query-locale-suggestions';

export default function () {
	return (
		<div>
			<QueryLocaleSuggestions />
		</div>
	);
}
```
