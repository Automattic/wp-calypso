# Query Post Likes

`<QueryPostLikes />` is a React component used in managing network requests for post likes.

## Usage

Render the component, passing `siteId` and `postId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostLikes from 'calypso/components/data/query-post-likes';
import MyPostLikesListItem from './list-item';

export default function Component( { likes } ) {
	return (
		<div>
			<QueryPostLikes siteId={ 12345678 } postId={ 50 } />
			{ likes.map( ( like ) => {
				return <MyPostLikesListItem likeId={ like.ID } />;
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

The site ID for which post likes should be requested.

### `postId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post ID for which post likes should be requested.
