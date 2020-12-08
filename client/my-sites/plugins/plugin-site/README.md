# Plugin Site

This component is used to represent the state of a single instance of a plugin in a site. Internally, it follows a factory pattern, returning one instance of `plugin-site-network` or `plugin-site-jetpack` depending on the properties of the site received.

## How to use

```js
import PluginSite from 'calypso/my-sites/plugins/plugin-site/plugin-site';

function render() {
	return (
		<PluginSite
			site={ site }
			secondarySites={ this.getSecondaryPluginSites( site ) }
			plugin={ this.state.plugin }
			wporg={ this.state.plugin.wporg }
			notices={ this.state.notices }
		/>
	);
}
```

## Props

- `site`: a site object with the site which would be associated to the component.
- `secondarySites`: if `site` is a network site, secondarySites should contain an array with the lists secondary sites of the network.
- `plugin`: a plugin data object.
- `notices`: a notices object
- `wporg`: (boolean) whether the plugin is from the .org repository or not
