# Query Active Theme

Query Active Theme is a React component used in managing fetching of a given site's active theme ID.

## Usage

Render the component, passing `siteId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import { getActiveTheme } from 'calypso/state/themes/selectors';

function MyActiveTheme( { activeTheme } ) {
	return (
		<div>
			<QueryActiveTheme siteId={ 3584907 } />
			<div>My site active theme ID: { activeTheme }.</div>
		</div>
	);
}

export default connect( ( state ) => ( {
	activeTheme: getActiveTheme( state, 3584907 ),
} ) )( MyActiveTheme );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which active theme data should be queried.
