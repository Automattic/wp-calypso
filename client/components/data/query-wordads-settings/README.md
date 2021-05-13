# Query WordAds Settings

`<QueryWordadsSettings />` is a React component used in managing network requests for retrieving and storing WordAds settings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryWordadsSettings from 'calypso/components/data/query-wordads-settings';

export default function MySettings( { settings } ) {
	return (
		<div>
			<QueryWordadsSettings siteId={ 3584907 } />

			{ settings.map( ( setting ) => (
				<div key={ setting.key }>
					{ setting.key }: { setting.value }
				</div>
			) ) }
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

The site ID for which WordAds settings should be requested.
