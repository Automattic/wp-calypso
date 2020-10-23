# Query Sharing Buttons

`<QuerySharingButtons />` is a React component used in managing network requests for site's sharing buttons.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySharingButtons from 'calypso/components/data/query-sharing-buttons';

export default function MySettingsPage( { buttons } ) {
	return (
		<div>
			<QuerySharingButtons siteId={ 3584907 } />
			<div>{ JSON.stringify( buttons ) }</div>
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

The site ID for which the buttons should be requested.
