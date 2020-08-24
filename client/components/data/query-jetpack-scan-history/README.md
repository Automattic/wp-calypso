# Query Jetpack Scan History

`<QueryJetpackScanHistory />` is a React component used in managing network requests for Jetpack Scan History.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackScanHistory from 'components/data/query-jetpack-scan-history';
import Scan from './scan';

export default function MyJetpackScanHistory( { jetpackScanHistory } ) {
	return (
		<div>
			<QueryJetpackScanHistory siteId={ 12345678 } />
			<ScanHistory history={ jetpackScanHistory } />
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

The site ID for which Jetpack Scan History should be requested.
