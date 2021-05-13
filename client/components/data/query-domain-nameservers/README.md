# QueryDomainNameservers

`<QueryDomainNameservers />` is a React component used in managing network requests for domain nameservers for a given domain name.

## Usage

Render the component, passing `domainName`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import QueryDomainNameservers from 'calypso/components/data/query-domain-nameservers';
import { getNameserversByDomainName } from 'calypso/state/domains/nameservers/selectors';

export default function MyDomainNameservers( { domainName } ) {
	const nameservers = useSelector( ( state ) => getNameserversByDomainName( state, domainName ) );

	return (
		<div>
			<QueryDomainNameservers domainName={ domainName } />

			{ nameservers.list?.map( ( nameserver ) => (
				<div key={ nameserver }>{ nameserver }</div>
			) ) }
		</div>
	);
}
```

## Props

### `domainName`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The domain name for which nameservers should be requested.
