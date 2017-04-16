Query Site Monitor Settings
================

`<QuerySiteMonitorSettings />` is a React component used in managing network requests for retrieving Monitor settings for a Jetpack site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QuerySiteMonitorSettings from 'components/data/query-site-monitor-settings';

export default function ExampleSiteComponent( { siteMonitorSettings, translate } ) {
	return (
		<div>
			<QuerySiteMonitorSettings siteId={ 12345678 } />
			{
				siteMonitorSettings && siteMonitorSettings.monitor_active
					? translate( 'Monitor is enabled' )
					: translate( 'Monitor is disabled' )
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

The site ID for which the monitor settings should be requested.