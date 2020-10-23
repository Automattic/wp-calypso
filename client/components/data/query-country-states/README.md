# Query Country States

`<QueryCountryStates />` is a React component used in managing network requests for states of a specific country.

## Usage

Render the component, passing `countryCode`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryCountryStates from 'calypso/components/data/query-country-states';

export default function MyStatesList( { countryStates } ) {
	return (
		<ul>
			<QueryCountryStates countryCode="us" />
			{ countryStates.map( ( state ) => (
				<li>{ state.name }</li>
			) ) }
		</ul>
	);
}
```

## Props

### `countryCode`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The country code for which states should be requested. Example: `us`, `ca`.
