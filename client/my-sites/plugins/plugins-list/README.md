# Plugins List

This component is used to represent a list `PluginItem`s, with a `PluginsListHeader` serving as a title for the whole bunch.

## How to use

```jsx
import PluginsList from 'calypso/my-sites/plugins/plugins-list';

return (
	<PluginsList
		header={ this.props.translate( 'Plugins' ) }
		plugins={ this.getPlugins() }
		sites={ this.props.sites }
		selectedSite={ this.props.selectedSite }
		isPlaceholder={ this.showPluginListPlaceholders( true ) }
	/>
);
```

## Props

- `plugins`: An array of plugins objects.
- `header`: A string describing the plugin list.
- `sites`: An object describing the sites list object.
- `selectedSite`: An object or false of the single site.
- `pluginUpdateCount`: Number of plugin updates that need to happen.
- `isPlaceholder`: Weather to show a placeholder.
