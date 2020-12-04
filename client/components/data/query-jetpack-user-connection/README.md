# Query Jetpack User Connection

`<QueryJetpackUserConnection />` is a React component used in managing network requests for Jetpack current user connection data.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import QueryJetpackUserConnection from 'calypso/components/data/query-jetpack-user-connection';
import MyJetpackConnectionDataBlock from './data-block';
import getJetpackUserConnection from 'calypso/state/selectors/get-jetpack-user-connection';

function MyJetpackConnectionData( { jetpackConnection } ) {
	return (
		<div>
			<QueryJetpackUserConnection siteId={ 12345678 } />
			<MyJetpackConnectionDataBlock connectionData={ jetpackConnection } />
		</div>
	);
}

export default connect( ( state ) => ( {
	jetpackConnection: getJetpackUserConnection( state, 12345678 ),
} ) )( MyJetpackConnectionData );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack user connection data should be requested.
