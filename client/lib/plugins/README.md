# Plugins

Plugins uses a [flux](https://facebook.github.io/flux/docs/overview.html#content) approach to managing plugins data in calypso.

**Note: usage of the plugins store is discouraged, please use the Redux version instead**

## Plugins Store

The Plugins Store is responsible for keeping each site's plugin list up to date. Initially it loads the data and request it as it gets updated. This store also listens to any actions relevant to keep the data up to date such as the plugin update/activate/deactivate etc.

### The Data

The Data that is stored in the sites plugin store looks like this:

```js
const object = {
	123456: {
		// site.ID
		akismet: {
			// plugin.slug
			active: true,
			author: 'Automattic',
			author_url: 'http://automattic.com/wordpress-plugins/',
			autoupdate: false,
			description:
				'Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from comment and trackback spam</strong>. It keeps your site protected from spam even while you sleep. To get started: 1) Click the "Activate" link to the left of this description, 2) <a href="http://akismet.com/get/">Sign up for an Akismet API key</a>, and 3) Go to your Akismet configuration page, and save your API key.',
			id: 'akismet/akismet',
			name: 'Akismet',
			network: false,
			plugin_url: 'http://akismet.com/',
			slug: 'akismet',
			version: '3.1.1',
			update: {
				id: '1232',
				new_version: '3.1.2',
				package: 'https://downloads.wordpress.org/plugin/akismet.1.6.zip',
				plugin: 'akismet/akismet',
				slug: 'akismet',
				url: 'https://wordpress.org/plugins/akismet/',
			},
			selected: true,
		}, //, etc.
	}, //, etc.
};
```

The Data is stored in a private variable but can be accessed though the stores public methods.

### Public Methods

#### PluginsStore.getPlugin( sites, pluginSlug );

Returns a plugin object that has a sites attribute which stores an array of sites objects that have that particular plugin.

---

#### PluginsStore.getPlugins( sites, pluginFilter );

Returns an array of plugin object that has a sites attribute which stores an array of sites objects that have that particular plugin.

Note: pluginFilter can be any of the following string: 'none' , 'all', 'active', 'inactive', 'updates'

---

#### PluginsStore.getSitePlugins( site );

Returns an array of plugin objects for a particular site.

---

#### PluginsStore.getSitePlugin( site, pluginSlug );

Returns a plugin objects for a particular site.

---

#### PluginsStore.getSites( sites, pluginSlug );

Returns an array of sites that have a particular plugin.

### Example Component Code

```js
/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import PluginsStore from 'calypso/lib/plugins/store';

export default class extends React.Component {
	static displayName = 'yourComponent';

	state = this.getPlugins();

	componentDidMount() {
		PluginsStore.on( 'change', this.refreshSitesAndPlugins );
	}

	componentWillUnmount() {
		PluginsStore.removeListener( 'change', this.refreshSitesAndPlugins );
	}

	getPlugins = () => {
		const sites = this.props.sites.getSelectedOrAllWithPlugins();

		return {
			plugins: PluginsStore.getPlugins( sites ),
		};
	};

	refreshSitesAndPlugins = () => {
		this.setState( this.getPlugins() );
	};

	render() {}
}
```

## Actions

Actions get triggered by views and stores.

### Public methods

Triggers api call to fetch the site data.

#### PluginsActions.fetchSitePlugins( site );

---

Update a plugin on a site.

This action has been migrated to Redux. Please use the `updatePlugin` Redux action.

---

Toggle a plugin active state on a site.

This action has been migrated to Redux. Please use the `togglePluginActivation` Redux action.

---

Activate a plugin on a site.

This action has been migrated to Redux. Please use the `activatePlugin` Redux action.

---

Deactivate a plugin on a site.

This action has been migrated to Redux. Please use the `deactivatePlugin` Redux action.

---

Enable AutoUpdates for a plugin on a site.

This action has been migrated to Redux. Please use the `enableAutoupdatePlugin` Redux action.

---

Disable AutoUpdates for a plugin on a site.

This action has been migrated to Redux. Please use the `disableAutoupdatePlugin` Redux action.

---

Toggle AutoUpdates for a plugin on a site.

This action has been migrated to Redux. Please use the `togglePluginAutoUpdate` Redux action.
