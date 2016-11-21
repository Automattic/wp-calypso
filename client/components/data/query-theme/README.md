Query Themes
============

Query Themes is a React component used in managing the fetching of themes queries.

## Usage

Render the component, passing `siteId` and `themeId`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```
import React from 'react';
import { connect } from 'react-redux';
import QueryTheme from 'components/data/query-theme';
import Theme from 'components/theme';
import { getThemeById } from 'state/themes/selectors';

function MyTheme( { themes } ) {
	return (
		<div>
			<QueryTheme
				siteId={ 3584907 }
				themeId={ 'twentysixteen' } />
				<Theme
					key={ theme.id }
					theme={ theme } />
			} }
		</div>
	);
}

export default connect(
	( state, { themeId } ) => ( {
		theme: getThemeById( state, themeId )
	} )
)( MyTheme );
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The site ID for which themes should be queried.

### `themeId`

<table>
	<tr><th>Type</th><td>string</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
	<tr><th>Default</th><td><code>''</code></td></tr>
</table>

The theme Id of theme we wish to obtain.
