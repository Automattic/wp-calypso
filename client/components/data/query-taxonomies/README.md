Query Taxonomies
================

`<QueryTaxonomies />` is a React component used in managing network requests for post type taxonomies.

## Usage

Render the component, passing `siteId` and `postType`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryTaxonomies from 'components/data/query-taxonomies';

export default function MyTaxonomiesList( { taxonomies } ) {
	return (
		<ul>
			<QueryTaxonomies
				siteId={ 3584907 }
				postType="post" />
			{ taxonomies.map( ( taxonomy ) => {
				return (
					<li key={ taxonomy.name }>
						{ taxonomy.label }
					</li>
				);
			} }
		</ul>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which taxonomies should be requested.

### `postType`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post type for which taxonomies should be requested.
