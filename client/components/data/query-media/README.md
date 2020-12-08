# Query Media

Query Media is a React component used in managing the fetching of media queries.

## Usage

Render the component, passing `siteId` and `query` or a `siteId` and `mediaId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryMedia from 'calypso/components/data/query-media';
import MyMediaListItem from './list-item';

export default function MyMediaList( { media } ) {
	return (
		<div>
			<QueryMedia siteId={ 3584907 } query={ { search: 'Themes' } } />
			{ media.map( ( medium ) => {
				return <MyMediaListItem key={ item.ID } item={ item } />;
			} ) }
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The site ID for which media should be queried.

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The query to be used in requesting media.

### `mediaId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The media ID to query (if you want to perform a single media query)
