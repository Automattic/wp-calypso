# Wporg Plugins

A module for managing plugins data received from the WordPress.org plugins API.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchPluginData( pluginSlug: String )`

Fetches the info of a plugin from .org plugins API.

```js
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';

dispatch( fetchPluginData( 'akismet' ) );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `plugins.wporg`, with the following structure:

```js
state.plugins.wporg.items = {
	akismet: {
		isFetching: false,
		banners: {
			low: '//ps.w.org/akismet/assets/banner-772x250.jpg?rev=969272',
		},
		name: 'Akismet',
		compatibility: [ '4.4', '4.4.1' ],
		detailsFetched: 1453374999813,
		screenshots: null,
		fetched: true,
		plugin_url: 'http://akismet.com/',
		short_description:
			'Akismet checks your comments against the Akismet Web service to see if they look like spam or not.',
		author_url: 'http://automattic.com/wordpress-plugins/',
		num_ratings: 476,
		ratings: {
			1: 19,
			2: 3,
			3: 6,
			4: 15,
			5: 433,
		},
		version: '3.1.7',
		sections: {
			description: '<p>Description</p>',
			changelog: '<h4>Changelog</h4>',
		},
		icon: '//ps.w.org/akismet/assets/icon-256x256.png?rev=969272',
		author: '<a href="http://automattic.com/wordpress-plugins/">Automattic</a>',
		downloaded: 43336816,
		last_updated: '2016-01-04 11:15pm GMT',
		slug: 'akismet',
		author_name: 'Automattic',
		rating: 96,
	},
	/*...*/
};
```
