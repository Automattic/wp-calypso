Query Jetpack Module Settings
================

`<QueryJetpackModuleSettings />` is a React component used in managing network requests for settings of a specific Jetpack site module.

## Usage

Render the component, passing `siteId` and `moduleSlug`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackModuleSettings from 'components/data/query-jetpack-module-settings';
import MyJetpackModuleSettingsListItem from './list-item';

export default function MyJetpackModuleSettingsList( { jetpackModuleSettings } ) {
	return (
		<div>
			<QueryJetpackModuleSettings siteId={ 12345678 } />
			{ jetpackModuleSettings.map( ( setting ) => {
				return (
					<MyJetpackModuleSettingsListItem setting={ setting } />
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

The site ID for which the Jetpack module settings should be requested.

### `moduleSlug`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The slug of the Jetpack module to request settings for.
