Query Countries
====================

`<QueryCountries />` is a React component used in managing network requests for country list for specific purposes.

## Usage

Render the component, passing `listType`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { listTypes } from 'state/countries/constants'; 
import QueryCountries from 'components/data/query-countries';

export default function MyCountries( { countries } ) {
	return (
		<ul>
			<QueryCountries listType={ listTypes.DOMAIN } />
			{ countries.map( ( country ) => <li>{ country.name }</li> ) }
		</ul>
	);
}
```

## Props

### `listType`

<table>
	<tr><th>Type</th><td>Constant</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The type of country list for the use case as defined in `state/countries/constants`.
