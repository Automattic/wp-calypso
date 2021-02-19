# Query Recent Post Views

`<QueryRecentPostViews />` is a React component used to request views of a set of posts across a given time period.

## Usage

Render the component, passing `siteId` and `postIds`. It does not accept any children, nor does it render any element to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryRecentPostViews from 'calypso/components/data/query-stats-recent-post-views';

export default function ViewCount( { viewCount } ) {
	return (
		<div>
			<QueryPostsViews siteId={ 12345678 } postIds={ [ 1, 2, 3, 4 ] } num={ 30 } />
			<div>{ viewCount }</div>
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

The site ID.

### `postIds`

<table>
	<tr><th>Type</th><td>Array[Number]</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

An array of post IDs for which we'll retrieve view data.

### `date`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The most recent day from which to query views for `postIds` in `YYYY-MM-DD` format. Defaults to current date.

### `num`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The number of days from `date` to query views for `postIds`. Defaults to 1.
