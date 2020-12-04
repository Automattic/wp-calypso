# Query Jetpack Connection

`<QueryJetpackConnection />` is a React component used in managing network requests for Jetpack site connection status.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackConnection from 'calypso/components/data/query-jetpack-connection';
import MyJetpackConnectionStatusBlock from './status-block';

export default function MyJetpackConnectionStatus( { jetpackConnection } ) {
	return (
		<div>
			<QueryJetpackConnection siteId={ 12345678 } />
			<MyJetpackConnectionStatusBlock connectionStatus={ jetpackConnection } />
		</div>
	);
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack connection status should be requested.
