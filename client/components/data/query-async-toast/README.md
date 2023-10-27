# Query Async Toasts

`<QueryAsyncToast />` is a React component used in managing network requests for asynchronous toast notifications.

## Usage

Render the component as a child in any component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import { QueryAsyncToast } from 'calypso/components/data/query-async-toast';

export default function MyComponent( props ) {
	return (
		<div>
			<QueryAsyncToast siteId={ siteId } />
			<OtherComponent { ...props } />
		</div>
	);
}
```

## Props

- `siteId: SiteId`: ID of the site we're fetching notifications for.
