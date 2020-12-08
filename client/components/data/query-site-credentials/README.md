# Query Site Credentials

`<QuerySiteCredentials />` is a React component used in managing network requests for retrieving the Rewind system site credentials.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteCredentials from 'calypso/components/data/query-site-credentials';

export default function ExampleSiteComponent( { siteCredentials, translate } ) {
	return (
		<div>
			<QuerySiteCredentials siteId={ 12345678 } />
			{ siteCredentials.length
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

The site ID for which the WordPress.com credentials should be requested.
