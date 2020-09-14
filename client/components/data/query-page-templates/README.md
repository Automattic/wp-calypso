# Query Page Templates

`<QueryPageTemplates />` is a React component used in managing network requests for page templates.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPageTemplates from 'components/data/query-page-templates';

export default function MyPostTypesList( { pageTemplates } ) {
	return (
		<div>
			<QueryPageTemplates siteId={ 3584907 } />
			{ pageTemplates.map( ( template ) => template.label ) }
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

The site ID for which page templates should be requested.
