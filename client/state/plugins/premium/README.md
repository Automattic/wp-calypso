Premium Plugins
===============

A module for managing the automatic install & configuration of premium plugins

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchInstallInstructions( siteId: number )`

Get a list of plugins to auto-install for a given site. Plugin information returned includes the registration keys.

```js
import { fetchInstallInstructions } from 'state/plugins/premium/actions';

fetchInstallInstructions( 106093271 );
```

### `installPlugin( plugin: object, siteId: object )`

Start the install process for a plugin. Plugin object should be pulled from the [PluginsStore](https://github.com/Automattic/wp-calypso/tree/master/client/lib/plugins).

```js
import { installPlugin } from 'state/plugins/premium/actions';

let plugin = PluginsStore.getSitePlugin( site, 'vaultpress' );
installPlugin( plugin, site );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `plugins.premium`, with the following structure:

```js
state.plugins.premium = {
	isRequesting: {
		'exampleSiteId': false
	},
	plugins: {
		'exampleSiteId': [ {
			slug: 'vaultpress',
			name: 'VaultPress',
			key: 'vp-api-key',
			status: 'wait',
			error: null
		}, {
			slug: 'akismet',
			name: 'Akismet',
			key: 'ak-api-key',
			status: 'wait',
			error: null
		}, {
			slug: 'polldaddy',
			name: 'Polldaddy',
			key: 'pd-api-key',
			status: 'wait',
			error: null
		} ]
	}
}
```
