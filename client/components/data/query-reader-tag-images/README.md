# Query Reader Tag Images

`<QueryReaderTagImages />` is a React component used in managing network requests for Reader tag images.

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryReaderTagImages from 'calypso/components/data/query-reader-tag-images';
import MyListItem from './list-item';

export default function MyReaderTagImages( { images } ) {
	return (
		<div>
			<QueryReaderTagImages tag={ 'bananas' } />
			{ images.map( ( image ) => {
				return <MyListItem key={ image.url } image={ image } />;
			} ) }
		</div>
	);
}
```
