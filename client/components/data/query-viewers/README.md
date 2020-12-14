# QueryViewers

`<QueryViewers />` is a React component used in managing network requests for viewers of a given site.

## Usage

Render the component, passing `siteId`, `page` and `numbers`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import QueryViewers from 'calypso/components/data/query-viewers';
import { getViewers } from 'calypso/state/selectors/get-viewers';

export default function ViewersList( { siteId } ) {
	const siteId = 1;
	const viewers = useSelector( ( state ) => getViewers( state, siteId ) );

	return (
		<div>
			<QueryViewers siteId={ siteId } page={ 2 } />

			{ viewers?.map( ( viewer ) => (
				<div key={ viewer.ID }>{ viewer.name }</div>
			) ) }
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

### `page`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>`1`</td></tr>
</table>
