# Query Canonical Theme

Query Canonical Theme is a React component used in managing the fetching of individual theme objects from what is considered their 'canonical' source, i.e. the one with richest information. It checks WP.com (which has a long description and multiple screenshots, and a preview URL) first, then WP.org (which has a preview URL), then the given fallback JP site.

## Usage

Render the component, passing `siteId` and `themeId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import { connect } from 'react-redux';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import Theme from 'calypso/components/theme';
import { getCanonicalTheme } from 'calypso/state/themes/selectors';

function MyTheme( { theme } ) {
	return (
		<div>
			<QueryCanonicalTheme siteId={ 3584907 } themeId={ 'twentysixteen' } />
			<Theme theme={ theme } />} }
		</div>
	);
}

export default connect( ( state ) => ( {
	theme: getCanonicalTheme( state, 3584907, 'twentysixteen' ),
} ) )( MyTheme );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The site ID which should be used as a fallback if the theme cannot be found on WP.com or WP.org.

### `themeId`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td><code>''</code></td></tr>
</table>

The theme Id of theme we wish to obtain.
