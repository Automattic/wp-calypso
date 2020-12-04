# Query Site Monitor Settings

`<QuerySiteMonitorSettings />` is a React component used in managing network requests for retrieving Monitor settings for a Jetpack site.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import QuerySiteMonitorSettings from 'calypso/components/data/query-site-monitor-settings';
import getSiteMonitorSettings from 'calypso/state/selectors/get-site-monitor-settings';

function ExampleSiteComponent( { siteMonitorSettings, translate } ) {
	return (
		<div>
			<QuerySiteMonitorSettings siteId={ 12345678 } />
			{ siteMonitorSettings && siteMonitorSettings.monitor_active
				? translate( 'Monitor is enabled' )
				: translate( 'Monitor is disabled' ) }
		</div>
	);
}

export default connect( ( state ) => ( {
	siteMonitorSettings: getSiteMonitorSettings( state, 12345678 ),
} ) )( localize( ExampleSiteComponent ) );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which the monitor settings should be requested.
