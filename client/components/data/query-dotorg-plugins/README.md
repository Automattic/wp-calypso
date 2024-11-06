# Query Dotorg Plugins

`<QueryDotorgPlugins />` is a React component used in managing network requests for Dotorg plugins for a given plugin list.

## Usage

Render the component, passing a list of `pluginSlugList[]`. It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import QueryDotorgPlugins from 'calypso/components/data/query-dotorg-plugins';

export default function AmazingPluginsList( { plugins } ) {
	const pluginSlugList = [
		'plugin-1',
		'plugin-2',
	];

	return (
		<div>
			<QueryDotorgPlugins pluginSlugList />
		</div>
	);
}
```

## Props

### `pluginSlugList`

<table>
	<tr><th>Type</th><td>Array</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The Dotorg plugin slug list that should be requested.
