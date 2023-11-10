`<FetchSites />` is a React component that uses React Query to manage network requests for the `me/sites` endpoint.

## Usage

This component does not accept any children, nor does it render any elements itself.

Its sole purpose is to fetch and manage the data from the `me/sites` endpoint. After fetching the data, it updates the Redux state with the fetched sites data.

```jsx
import FetchSites from 'calypso/components/data/fetch-sites';

function MyComponent() {
	return (
		<div>
			<FetchSites />
			{ /* Other components */ }
		</div>
	);
}

export default MyComponent;
```

When `<FetchSites />` is included in a component, it automatically triggers a network request to fetch the sites associated with the current user. The fetched data is then managed by React Query and subsequently updates the Redux state.
