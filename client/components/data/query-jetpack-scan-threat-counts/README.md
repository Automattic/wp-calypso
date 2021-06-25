# Query Jetpack Scan Threat Counts

`<QueryJetpackScanThreatCounts />` is a React component used in managing network requests for Jetpack Scan Threat Counts.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackScanThreatCounts from 'calypso/components/data/query-jetpack-scan-threat-counts';
import Scan from './scan';

export default function MyJetpackScanThreatCounts( { jetpackScanThreatCounts } ) {
	return (
		<div>
			<QueryJetpackScanThreatCounts siteId={ 12345678 } />
			<ScanThreatCounts threatCounts={ jetpackScanThreatCounts } />
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

The site ID for which Jetpack Scan Threat Counts should be requested.
