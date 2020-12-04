# Query All Domains

`<QueryAllDomains />` is a React component used in managing network requests for all of a user's domains across sites.

## Usage

Render the component. It does not accept any properties and/or children, nor does it render any elements to the page.

```jsx
import QueryAllDomains from 'calypso/components/data/query-all-domains';

export default function listAllDomains( { domains } ) {
	return (
		<div>
			<QueryAllDomains />
			{ domains.map( ( domain ) => (
				<li>{ domain.domain }</li>
			) ) }
		</div>
	);
}
```
