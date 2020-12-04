# Query Post Formats

`<QueryPostFormats />` is a React component used in managing network requests for post formats.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostFormats from 'calypso/components/data/query-post-formats';
import MyPostFormatsListItem from './list-item';

export default function MyPostFormatsList( { postFormats } ) {
	return (
		<div>
			<QueryPostFormats siteId={ 12345678 } />
			{ postFormats.map( ( label, id ) => {
				return <MyPostFormatsListItem postFormatId={ id } />;
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
</table>

The site ID for which post formats should be requested.
