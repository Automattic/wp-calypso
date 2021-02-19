# Query Site Connection Status

`<QuerySiteConnectionStatus />` is a React component used in managing network requests for retrieving WordPress.com connection status of a Jetpack site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteConnectionStatus from 'calypso/components/data/query-site-connection-status';

export default function ExampleSiteComponent( { siteConnectionStatus, translate } ) {
	return (
		<div>
			<QuerySiteConnectionStatus siteId={ 12345678 } />
			{ siteConnectionStatus
				? translate( 'Site is connected' )
				: translate( 'Site is not connected' ) }
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

The site ID for which the WordPress.com connection status should be requested.
