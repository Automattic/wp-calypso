# Query Post Stats

`<QueryPostStats />` is a React component used in managing network requests for post stats.

## Usage

Render the component, passing `siteId`, `postId` and `fields`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostStats from 'calypso/components/data/query-post-stats';

export default function Component( { statValue } ) {
	return (
		<div>
			<QueryPostStats siteId={ 3584907 } postId={ 4533 } fields={ [ 'views' ] } />
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

The site ID for which the post stat should be requested.

### `postId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The post ID for which the stat should be requested.

### `fields`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The stats fields being requested.

### `heartbeat`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The interval in milliseconds before refreshing the stat.
By default the stat will be fetched once and never refreshed.
