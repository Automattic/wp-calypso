# Query Help Links

`<QueryHelpLinks />` is a React component used in managing network requests for help links.

## Usage

Render the component, passing `query`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryHelpLinks from 'calypso/components/data/query-help-links';

export default function MyHelpLinksSection( { links } ) {
	return (
		<div>
			<QueryHelpLinks query={ 'jetpack' } />
			<div>{ JSON.stringify( links ) }</div>
		</div>
	);
}
```

## Props

### `query`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The search query for which the help links should be requested.
