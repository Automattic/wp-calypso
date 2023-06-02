# Query Email Stats

`<QueryEmailStats />` is a React component used in managing network requests for email stats.

## Usage

Render the component, passing `siteId`, `postId` and `fields`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import QueryEmailStats from 'calypso/components/data/query-email-stats';

export default function Component( { statValue } ) {
	return (
		<div>
			<QueryEmailStats siteId={ 3584907 } postId={ 4533 } fields={ [ 'views' ] } />
			<div>{ statValue }</div>
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The site ID for which the email stat should be requested.

### `postId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The post ID for which the email stat should be requested.

### `fields`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The stats fields being requested.
