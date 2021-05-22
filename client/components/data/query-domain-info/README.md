# QueryDomainInfo

`<QueryDomainInfo />` is a React component used in managing network requests for domain WAPI information for a given domain name.

## Usage

Render the component, passing `domainName`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { useSelector } from 'react-redux';
import QueryDomainInfo from 'calypso/components/data/query-domain-info';
import { getDomainWapiInfoByDomainName } from 'calypso/state/domains/transfer/selectors';

export default function MyDomainInfo( { domainName } ) {
	const info = useSelector( ( state ) => getDomainWapiInfoByDomainName( state, domainName ) );

	return (
		<div>
			<QueryDomainInfo domainName={ domainName } />

			{ info.hasLoadedFromServer && (
				<React.Fragment>
					Needs update: { info?.needsUpdate }
					Pending transfer: { info?.pendingTransfer }
				</React.Fragment>
			) }
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

The domain name for which domain info should be requested.
