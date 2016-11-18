Query Themes
============

Query Themes is a React component used in managing the fetching of themes queries.

## Usage

Render the component, passing `siteId` and `query`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryThemes from 'components/data/query-themes';
import Theme from 'components/theme';

export default function MyThemesList( { themes } ) {
	return (
		<div>
			<QueryThemes
				siteId={ 3584907 }
				query={ { search: 'Automattic' } } />
			{ themes.map( ( theme ) => {
				return (
					<Theme
						key={ theme.id }
						theme={ theme } />
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
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The site ID for which themes should be queried.

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The query to be used in requesting themes.
