# Query Keyring Connections

`<QueryKeyringConnections />` is a React component used in managing network requests for keyring connections.

## Usage

Render the component without props. It does not accept any children, nor does it render any elements to the page.

```jsx
import React from 'react';
import QueryKeyringConnections from 'calypso/components/data/query-keyring-connections';

export default function MyConnectionsList( { connections } ) {
	return (
		<ul>
			<QueryKeyringConnections />
			{ connections.map( ( connection ) => (
				<li>{ connection.label }</li>
			) ) }
		</ul>
	);
}
```
