Query Jetpack Jumpstart
================

`<QueryJetpackJumpstart />` is a React component used in managing network requests for Jetpack Jumpstart status for a specified site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackJumpstart from 'components/data/query-jetpack-jumpstart';

export default function MyJetpackJumpstartCard( { jumpstartStatus } ) {
	return (
		<div>
			<QueryJetpackJumpstart siteId={ 12345678 } />
			{ jumpstartStatus === 'jumpstart_activated'
				? 'Jumpstart is activated'
				: 'Jumpstart is dismissed'
			}
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

The site ID for which Jetpack Jumpstart status should be requested.
