Premium Plugins
===============

A module for managing the automatic install & configuration of premium plugins

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchInstallInstructions( siteId: number )`

Get a list of plugins to auto-install for a given site. Plugin information returned includes the registration keys.

```js
import { fetchInstallInstructions } from 'state/plugins/premium/actions';

dispatch( fetchInstallInstructions( 106093271 ) );
```

### `installPlugin( plugin: object, siteId: number )`

Start the install process for a plugin. Plugin object should have `key` and `slug`.

```js
import { installPlugin } from 'state/plugins/premium/actions';

dispatch( installPlugin( { key: 'my-api-key', slug: 'akismet' }, 106093271 ) );
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `plugins.premium`, with the following structure:

```js
state.plugins.premium = {
	isRequesting: {
		106093271: false
	},
	plugins: {
		106093271: [ {
			slug: 'vaultpress',
			name: 'VaultPress',
			key: 'vp-api-key',
			status: {
				start: false, // false until active, true until finished
				install: null, // null => not started, true => active state, false => finished
				activate: null, // null => not started, true => active state, false => finished
				config: null, // null => not started, true => active state, false => finished
				done: false,
			},
			error: null
		}, {
			slug: 'akismet',
			name: 'Akismet',
			key: 'ak-api-key',
			status: {
				start: false,
				install: null,
				activate: null
				config: null,
				done: false,
			},
			error: null
		}, {
			slug: 'polldaddy',
			name: 'Polldaddy',
			key: 'pd-api-key',
			status: {
				start: false,
				install: null,
				activate: null,
				config: null,
				done: false,
			},
			error: null
		} ]
	}
}
```
