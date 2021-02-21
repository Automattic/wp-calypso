# Query Jetpack Modules

`<QueryJetpackModules />` is a React component used in managing network requests for Jetpack site modules.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import MyJetpackModulesListItem from './list-item';

export default function MyJetpackModulesList( { jetpackModules } ) {
	return (
		<div>
			<QueryJetpackModules siteId={ 12345678 } />
			{ jetpackModules.map( ( module ) => {
				return <MyJetpackModulesListItem module={ module } />;
			} ) }
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

The site ID for which Jetpack modules should be requested.
