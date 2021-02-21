# Plugin Site Network

This component is used to display a single instance of a plugin within a multisite network, including all the options & possible actions the user can do with it

## How to use

```js
import PluginSiteNetwork from 'calypso/my-sites/plugins/plugin-site/plugin-site-network';

function render() {
	return (
		<PluginSiteNetwork
			site={ site }
			plugin={ plugin }
			notices={ notices }
			secondarySites={ secondarySites }
		/>
	);
}
```

## Props

- `site`: a site object with the site which would be associated to the component.
- `plugin`: a plugin object.
- `notices`: a notices object.
- `secondarySites`: an array containing all the site objects of the sites belonging to this network
