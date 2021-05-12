# Plugin Item

This component is used to display a plugin card in a list of plugins.

## How to use

```js
import PluginItem from 'calypso/my-sites/plugins/plugin-item/plugin-item';

function render() {
	return (
		<div className="your-plugins-list">
			<PluginItem
				plugin={ plugin }
				isSelected={ !! this.state.checkedPlugins[ plugin.slug ] }
				isSelectable={ this.state.bulkManagement }
				onClick={ this.pluginChecked.bind( this, plugin.slug ) }
				pluginLink={ this.props.path + '/' + encodeURIComponent( plugin.slug ) + this.siteSuffix() }
			/>
		</div>
	);
}
```

## Props

- `plugin`: a plugin object.
- `sites`: an array of site objects
- `isSelected`: a boolean indicating if the plugin is selected.
- `isSelectable`: a boolean if the plugin is selectable. If true it will show a checkbox.
- `onClick`: onClick handler.
- `pluginLink`: the url of the plugin.
- `allowedActions`: an object of allowed plugin actions: `activation`, `autoupdate`. Used to display/hide plugin actions.
- `isAutoManaged`: a boolean if the plugin is auto managed. If true it will dispaly an auto managed message. Defaults to false.
- `progress`: an array of progress steps.
