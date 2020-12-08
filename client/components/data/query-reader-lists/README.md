# Query Reader Lists

`<QueryReaderLists />` is a React component used in managing network requests for Reader lists.

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryReaderLists from 'calypso/components/data/query-reader-lists';
import MyListItem from './list-item';

export default function MyReaderLists( { subscribedLists } ) {
	return (
		<div>
			<QueryReaderLists />
			{ subscribedLists.map( ( subscribedList ) => {
				return <MyListItem key={ subscribedList.slug } list={ subscribedList } />;
			} ) }
		</div>
	);
}
```
