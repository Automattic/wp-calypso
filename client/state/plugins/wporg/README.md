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

### `fetchPluginsList( category: String, page: Number, searchTerm: String )`

Fetches the list of plugins by category or search term from the WP.org plugins API. 
Please note that because of API limitations, WP.org plugins can be filtered either by category or search term, but not both at the same time.
Pagination is supported only for category queries. Category can be one of `featured`, `popular`, `new`, `beta` or `recommended`.
Search term is an open text field, and you can search single terms like "security" or "enhancement".

```js
import { fetchPluginsList } from 'calypso/state/plugins/wporg/actions';

// Fetch the first page of plugins from the "Popular" category
dispatch( fetchPluginsList( 'popular', 1 ) );

// Fetch the list of plugins that match the search term "security".
dispatch( fetchPluginsList( undefined, undefined, 'security' ) );
```

### `fetchPluginsCategoryNextPage( category: String )`

Fetches the next page of plugins for a certain category if the last page hasn't been reached yet.

```js
import { fetchPluginsCategoryNextPage } from 'calypso/state/plugins/wporg/actions';

dispatch( fetchPluginsCategoryNextPage( 'popular' ) );
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
