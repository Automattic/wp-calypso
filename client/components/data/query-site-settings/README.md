# Query Site Settings

`<QuerySiteSettings />` is a React component used in managing network requests for site settings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';

export default function MySettingsPage( { settings } ) {
	return (
		<div>
			<QuerySiteSettings siteId={ 3584907 } />
			<div>{ JSON.stringify( settings ) }</div>
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

The site ID for which the settings should be requested.
