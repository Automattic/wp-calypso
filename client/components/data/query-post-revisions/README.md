# Query Post Revisions

`<QueryPostRevisions />` is a React component used to request post revisions data.

## Usage

Render the component, passing `siteId` and `postId`. It does not accept any children, nor does it render any element to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostRevisions from 'calypso/components/data/query-post-revisions';

export default function PostRevisions( { revisions } ) {
	return (
		<div>
			<QueryPostRevisions siteId={ 12345678 } postId={ 10 } />
			<div>{ revisions }</div>
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

The site ID for which we request post revisions.

### `postId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post ID for which we request post revisions.
