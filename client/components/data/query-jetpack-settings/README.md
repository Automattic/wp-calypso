Query Jetpack Settings
======================

`<QueryJetpackSettings />` is a React component used in managing network requests for Jetpack Settings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import { getJetpackSettings } from 'state/selectors';
import QueryJetpackSettings from 'components/data/query-jetpack-settings';

function MyJetpackSettings( { settings, siteId } ) {
	const query = {
		token: 'skyfKuaiKjbd8mK0Ngo75XyzfeKjp8sA',
		userEmail: 'exampleuser@yourgroovydomain.com'
	};

	return (
		<div>
			<QueryJetpackSettings query={ query } siteId={ siteId } />
			{ map( settings, ( value, name ) => (
				<div>{ name }: { value.toString() }</div>
			) }
		</div>
	);
}

export default connect(
	( state, { siteId } ) => ( {
		settings: getJetpackSettings( state, siteId )
	} )
)( MyJetpackSettings );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack Settings should be requested.

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A query to use when requesting Jetpack Settings. We currently use this only to send Jetpack Onboarding credentials, which enable us to query and change a few settings through the REST API without needing to have a Jetpack site connected to WordPress.com.
