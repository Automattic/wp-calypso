# Query Wporg Plugins

`<QueryWporgPlugins />` is a React component used in managing network requests for retrieving and storing WordAds settings.

## Usage

Render the component, passing `category` or `searchTerm`, and optionally `page`.

WP.org plugins can be filtered either by `category` or `searchTerm`, so only one of those props should be specified.
Pagination is currently supported only for category queries in the API, so you can use `page` only together with `category`.

It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryWporgPlugins from 'calypso/components/data/query-wporg-plugins';
import { getPluginsListByCategory } from 'calypso/state/plugins/wporg/selectors';

export default function MyPlugins() {
	const category = 'popular';
	const plugins = useSelector( ( state ) => getPluginsListByCategory( state, category ) );

	return (
		<div>
			<QueryWporgPlugins category={ category } />

			{ plugin.map( ( plugin ) => (
				<div key={ plugin.slug }>
					{ plugin.slug }: { plugin.name }
				</div>
			) ) }
		</div>
	);
}
```

## Props

### `category`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Category for which to request plugins from. Can be one of "featured", "popular", "new", "beta" or "recommended".

### `page`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Page number. Pagination is currently supported only for category queries in the API, so you can use `page` only together with the `category` prop.

### `searchTerm`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Search term to query plugins by. Can accept any open values, for example "security" or "enhancement".
