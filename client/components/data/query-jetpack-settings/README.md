Query Jetpack Settings
================

`<QueryJetpackSettings />` is a React component used in managing network requests for settings of a specific Jetpack site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';
import MyJetpackSettingsListItem from './list-item';

export default function MyJetpackSettingsList( { jetpackSettings } ) {
	return (
		<div>
			<QueryJetpackSettings siteId={ 12345678 } />
			{ jetpackSettings.map( ( setting ) => {
				return (
					<MyJetpackSettingsListItem setting={ setting } />
				);
			} }
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

The site ID for which the Jetpack settings should be requested.