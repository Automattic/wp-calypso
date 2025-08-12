# Installed plugins

A module for managing installed plugins on connected sites.

## Actions

### `fetchPlugins( siteIds: Array )`

### `installPlugin( siteId: Number, plugin: Object )`

### `updatePlugin( siteId: Number, plugin: Object )`

### `removePlugin( siteId: Number, plugin: Object )`

### `activatePlugin( siteId: Number, plugin: Object )`

### `deactivatePlugin( siteId: Number, plugin: Object )`

### `enableAutoupdatePlugin( siteId: Number, plugin: Object )`

### `disableAutoupdatePlugin( siteId: Number, plugin: Object )`

## Selectors

### `isRequesting( state: Object, siteId: number|string )`

### `isRequestingForSites( state: Object, sites: Array )`

### `isRequestingForAllSites( state: Object )`

Returns the state of the network request for fetching all available plugins on all Jetpack sites of the current user.

### `getPlugins( state: Object, siteIds: Array, pluginFilter: Object )`

Get plugins installed on a list of sites (can also be just one site, but it should still be an array). Each plugin returned also lists the sites it's installed on in a `sites` property. Can be filtered by `active`, `inactive`, `updates`.

### `getPluginsWithUpdates( state: Object, siteIds: Array )`

### `getStatusForPlugin( state: Object, siteId: number|string, pluginId: String )`

Get the most recent status for a plugin action (including "inProgress" for currently-running actions).

### `getAllPluginsIndexedByPluginSlug( state: Object )`

Get an object of all installed plugins in all sites, indexed by the plugin slug.

### `getAllPluginsIndexedBySiteId( state: Object )`

Get an object of all installed plugins of each site, indexed by site ID.

## Reducer

Data from the aforementioned actions is added to the global state tree, under `plugins.installed`, with the following structure:

```js
state.plugins.installed = {
	isRequesting: {
		exampleSiteId: false,
	},
	plugins: {
		exampleSiteId: [
			{
				id: 'akismet/akismet',
				slug: 'akismet',
				active: true,
				name: 'Akismet',
				plugin_url: 'https://akismet.com/',
				version: '3.1.11',
				description:
					'Used by millions, Akismet is quite possibly the best way in the world to <strong>protect your blog from spam</strong>. It keeps your site protected even while you sleep. To get started: 1) Click the "Activate" link to the left of this description, 2) <a href="https://akismet.com/get/">Sign up for an Akismet plan</a> to get an API key, and 3) Go to your Akismet configuration page, and save your API key.',
				author: 'Automattic',
				author_url: 'https://automattic.com/wordpress-plugins/',
				network: false,
				autoupdate: true,
			},
			{
				id: 'hello-dolly/hello',
				slug: 'hello-dolly',
				active: false,
				name: 'Hello Dolly',
				plugin_url: 'https://wordpress.org/plugins/hello-dolly/',
				version: '1.6',
				description:
					'This is not just a plugin, it symbolizes the hope and enthusiasm of an entire generation summed up in two words sung most famously by Louis Armstrong: Hello, Dolly. When activated you will randomly see a lyric from <cite>Hello, Dolly</cite> in the upper right of your admin screen on every page',
				author: 'Matt Mullenweg',
				author_url: 'http://ma.tt/',
				network: false,
				autoupdate: true,
			},
		],
		exampleSiteIdTwo: [
			/*...*/
		],
		/*...*/
	},
	status: {
		exampleSiteIdTwo: {
			'akismet/akismet': {
				status: 'error',
				action: INSTALL_PLUGIN,
				error: createError( 'no_package', 'Download failed.' ),
			},
		},
	},
};
```
