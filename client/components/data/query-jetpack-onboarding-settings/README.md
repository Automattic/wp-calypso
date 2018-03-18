Query Jetpack Onboarding Settings
=================================

`<QueryJetpackOnboardingSettings />` is a React component used in managing network requests for Jetpack Onboarding Settings.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import { getJetpackOnboardingSettings } from 'state/selectors';
import QueryJetpackOnboardingSettings from 'components/data/query-jetpack-onboarding-settings';

function MyJetpackOnboardingSettings( { settings, siteId } ) {
	return (
		<div>
			<QueryJetpackOnboardingSettings siteId={ siteId } />
			{ map( settings, ( value, name ) => (
				<div>{ name }: { value.toString() }</div>
			) }
		</div>
	);
}

export default connect(
	( state, { siteId } ) => ( {
		settings: getJetpackOnboardingSettings( state, siteId )
	} )
)( MyJetpackOnboardingSettings );
```

## Props

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A query to use when requesting Jetpack Onboarding Settings.

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which Jetpack Onboarding Settings should be requested.
