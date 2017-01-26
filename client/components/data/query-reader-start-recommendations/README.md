Query Reader Start Recommendations
===================================

`<QueryReaderStartRecommendations />` is a React component used in managing network requests for Reader's /read/start (aka Cold Start).

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryReaderStartRecommendations from 'components/data/query-reader-start-recommendations';
import MyListItem from './list-item';

export default function MyReaderStartRecommendations( { recs } ) {
	return (
		<div>
			<QueryReaderStartRecommendations />
			{ recs.map( ( rec ) => {
				return (
					<MyListItem
						key={ rec.site_ID }
						recommendation={ rec } />
				);
			} }
		</div>
	);
}
```