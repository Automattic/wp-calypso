# Query Post Counts

`<QueryPostCounts />` is a React component used in managing network requests for post counts.

## Usage

Render the component, passing `siteId` and `type`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostCounts from 'calypso/components/data/query-post-counts';

export default function PostCount( { count } ) {
	return (
		<div>
			<QueryPostCounts siteId={ 3584907 } type="post" />
			<div>{ count }</div>
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which post counts should be requested.

### `type`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post type for which counts should be requested.
