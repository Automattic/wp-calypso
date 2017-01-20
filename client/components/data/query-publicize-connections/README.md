Query Publicize Connections
===========================

`<QueryPublicizeConnections />` is a React component used in managing network requests for Publicize connections.

## Usage

Render the component, optionally passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryPublicizeConnections from 'components/data/query-publicize-connetions';
import MyConnectionsListItem from './list-item';

export default function MyConnectionsList( { connections } ) {
	return (
		<div>
			<QueryPublicizeConnections siteId={ 3584907 } />
			{ connections.map( ( connection ) => (
				<MyConnectionsListItem
					key={ connection.ID }
					connection={ connection } />
			) ) }
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The site ID for which Publicize connections should be requested. Default: ID of selected site.
