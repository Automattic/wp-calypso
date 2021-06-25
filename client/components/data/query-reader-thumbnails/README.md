# Query Reader Thumbnails

`<QueryReaderThumbnails />` is a React component used in managing network requests for Reader thumbnail urls.

## Usage

Render the component. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryReaderThumbnails from 'calypso/components/data/query-reader-thumbnail';
import { getThumbnailForIframe } from 'calypso/state/reader/thumbnails/selectors';

function MyFeaturedAsset( { embedUrl, thumbnailUrl } ) {
	return (
		<div>
			<QueryReaderThumbnails embedUrl={ embedUrl } />
			<image src={ thumbnailUrl } />
		</div>
	);
}

connect( ( state, ownProps ) => ( {
	thumbnailUrl: getThumbnailForIframe( state, ownProps.embedUrl ),
} ) )( MyFeaturedAsset );
```
