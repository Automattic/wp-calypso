# Query Keyring Services

`<QueryKeyringServices />` is a React component used in managing network requests for keyring services.

## Usage

Render the component without props. It does not accept any children, nor does it render any elements to the page.

```jsx
import React from 'react';
import QueryKeyringServices from 'calypso/components/data/query-keyring-services';

export default function MyServicesList( { services } ) {
	return (
		<ul>
			<QueryKeyringServices />
			{ services.map( ( service ) => (
				<li>{ service.label }</li>
			) ) }
		</ul>
	);
}
```
