Plugins
=======

Plugins uses a [flux](https://facebook.github.io/flux/docs/overview.html#content) approach to managing plugins data in calypso.

###Plugins Store
The Plugins Store is responsible for keeping each site's plugin list up to date. Initially it loads the data and request it as it gets updated. This store also listens to any actions relevant to keep the data up to date such as the plugin update/activate/deactivate etc.

####The Data
The Data that is stored in the sites plugin store looks like this:

```js
{
	123456 : { // site.ID
		akismet : { // plugin.slug
			active: true,
			author: "Automattic",
			author_url: "http://automattic.com/wordpress-plugins/",
			autoupdate: false,
			description: "Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from comment and trackback spam</strong>. It keeps your site protected from spam even while you sleep. To get started: 1) Click the \"Activate\" link to the left of this description, 2) <a href=\"http://akismet.com/get/\">Sign up for an Akismet API key</a>, and 3) Go to your Akismet configuration page, and save your API key.",
			id: "akismet/akismet",
			name: "Akismet",
			network: false,
			plugin_url: "http://akismet.com/",
			slug: "akismet",
			version: "3.1.1",
			update: {
				id: "1232",
				new_version: "3.1.2",
				package: "https://downloads.wordpress.org/plugin/akismet.1.6.zip",
				plugin: "akismet/akismet",
				slug: "akismet",
				url: "https://wordpress.org/plugins/akismet/",
			}
			selected: true
		}, etc.
	}, etc.
}
```

 The Data is stored in a private variable but can be accessed though the stores public methods.

####Public Methods

**PluginsStore.getPlugin( sites, pluginSlug );**

Returns a plugin object that has a sites attribute which stores an array of sites objects that have that particular plugin.

---

**PluginsStore.getPlugins( sites, pluginFilter );**

Returns an array of plugin object that has a sites attribute which stores an array of sites objects that have that particular plugin.

Note: pluginFilter can be any of the following string: 'none' , 'all', 'active', 'inactive', 'updates'

---

** PluginsStore.getSitePlugins( site ); **

Returns an array of plugin objects for a particular site.

---

**PluginsStore.getSitePlugin( site, pluginSlug );**

Returns a plugin objects for a particular site.

---

**PluginsStore.getSites( sites, pluginSlug );**

Returns an array of sites that have a particular plugin.




####Example Component Code:

```es6
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginsStore = require( 'lib/plugins/store' );

module.exports = React.createClass( {

	displayName: 'yourComponent',

	componentDidMount: function() {
		PluginsStore.on( 'change', this.refreshSitesAndPlugins );
	},

	componentWillUnmount: function() {
		PluginsStore.removeListener( 'change', this.refreshSitesAndPlugins );
	},

	getInitialState: function() {
		return this.getPlugins();
	},

	getPlugins: function() {

		var sites = this.props.sites.getSelectedOrAllWithPlugins();

		return {
			plugins: PluginsStore.getPlugins( sites )
		};
	},

	refreshSitesAndPlugins: function() {
		this.setState( this.getPlugins() );
	},

	render: function() {

	}

} );

```


###Actions
Actions get triggered by views and stores.

####Public methods.

Triggers api call to fetch the site data.

**PluginsActions.fetchSitePlugins( site );**

---

Update a plugin on a site.

**PluginsActions.updatePlugin( site, plugin );**

---

Toggle a plugin active state on a site.

**PluginsActions.togglePluginActivation( site, plugin );**

---

Activate a plugin on a site.

**PluginsActions.activatePlugin( site, plugin );**

---

Deactivate a plugin on a site.

**PluginsActions.deactivatePlugin( site, plugin );**

---

Enable AutoUpdates for a plugin on a site.

**PluginsActions.enableAutoUpdatesPlugin( site, plugin );**

---

Disable AutoUpdates for a plugin on a site.

**PluginsActions.disableAutoUpdatesPlugin( site, plugin );**

---

Toggle AutoUpdates for a plugin on a site.

**PluginsActions.togglePluginAutoUpdate( site, plugin );**


####Example Component Code:

```jsx
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var PluginsActions = require( 'lib/plugins/actions' );

module.exports = React.createClass( {

	displayName: 'yourComponent',

	updatePlugin: function() {
		PluginsActions.updatePlugin( this.props.site, this.props.plugin );
	},

	render: function() {
		return (
			<button onClick={ this.updatePlugin } >Update { this.props.plugin.name }</button>
		)
	}

} );

```
