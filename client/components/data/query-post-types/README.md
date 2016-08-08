Query Post Types
================

`<QueryPostTypes />` is a React component used in managing network requests for post types.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPostTypes from 'components/data/query-post-types';
import MyPostTypesListItem from './list-item';

export default function MyPostTypesList( { postTypes } ) {
	return (
		<div>
			<QueryPostTypes siteId={ 3584907 } />
			{ postTypes.map( ( postType ) => {
				return (
					<MyPostTypesListItem
						key={ postType.name }
						postType={ postType } />
				);
			} }
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

The site ID for which post types should be requested.
