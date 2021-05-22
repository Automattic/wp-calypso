# Query Countries

`QueryDomainCountries`, `QueryPaymentCountries`, and `QuerySmsCountries` are React components used in managing network requests for lists of countries.

## Usage

Render the component without props. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryDomainCountries from 'calypso/components/data/query-countries/domains';

export default function CountriesList( { countries } ) {
	return (
		<ul>
			<QueryDomainCountries />
			{ countries.map( ( country ) => (
				<li>{ country.label }</li>
			) ) }
		</ul>
	);
}
```
