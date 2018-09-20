Query Terms
================

`<QueryTerms />` is a React component used in managing network requests for terms for a given site and taxonomy pair.

## Usage

Render the component, passing `siteId` and `taxonomy`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryTerms from 'components/data/query-terms';

export default function AmazingListOfTerms( { terms } ) {
	return (
		<ul>
			<QueryTerms
				siteId={ 3584907 }
				taxonomy="category" />
			{ terms.map( ( term ) => {
				return (
					<li key={ term.ID }>
						{ term.name }
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

The site ID for which terms should be requested.

### `taxonomy`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The taxonomy for which terms should be requested.

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Query object to be used for pagination, and search.
