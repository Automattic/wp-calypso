# Query Reader List

`<QueryReaderList />` is a React component used in managing network requests for single Reader lists.

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryReaderList from 'calypso/components/data/query-reader-list';
import MyListItem from './list-item';

export default function MyReaderList( { list } ) {
	return (
		<div>
			<QueryReaderList owner="ownervalue" slug="slugvalue" />
			<MyListItem key={ list.slug } list={ list } />
		</div>
	);
}
```
