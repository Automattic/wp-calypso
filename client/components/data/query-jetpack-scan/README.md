# Query Jetpack Scan

`<QueryJetpackScan />` is a React component used in managing network requests for Jetpack site Scan status.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackScan from 'components/data/query-jetpack-scan';
import Scan from './scan';

export default function MyJetpackScanStatus( { jetpackScanStatus } ) {
	return (
		<div>
			<QueryJetpackScan siteId={ 12345678 } />
			<Scan status={ jetpackScanStatus } />
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

The site ID for which Jetpack Scan status should be requested.
