# Query Jetpack Settings

`<QueryJetpackSettings />` is a React component used in managing network requests for Jetpack Settings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import { map } from 'lodash';
import React from 'react';
import { connect } from 'react-redux';
import QueryJetpackSettings from 'calypso/components/data/query-jetpack-settings';
import getJetpackSettings from 'calypso/state/selectors/get-jetpack-settings';

function MyJetpackSettings( { settings, siteId } ) {
	return (
		<div>
			<QueryJetpackSettings siteId={ siteId } />
			{ map( settings, ( value, name ) => (
				<div>
					{ name }: { value.toString() }
				</div>
			) ) }
		</div>
	);
}

export default connect( ( state, { siteId } ) => ( {
	settings: getJetpackSettings( state, siteId ),
} ) )( MyJetpackSettings );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack Settings should be requested.
