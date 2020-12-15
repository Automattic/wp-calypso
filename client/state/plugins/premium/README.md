# Premium Plugins

A module for managing the automatic install & configuration of premium plugins

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchInstallInstructions( siteId: number )`

Get a list of plugins to auto-install for a given site. Plugin information returned includes the registration keys.

```js
import { fetchInstallInstructions } from 'calypso/state/plugins/premium/actions';

fetchInstallInstructions( 106093271 );
```

### `installPlugin( plugin: object, siteId: object )`

Start the install process for a plugin.

```js
import { useDispatch, useSelector } from 'react-redux';
import { getPluginOnSite } from 'calypso/state/plugins/installed/selectors';
import { installPlugin } from 'calypso/state/plugins/premium/actions';

const MyComponent = ( { site } ) => {
	// Retrieve the plugin installed on the site via Redux
	const plugin = useSelector( ( state ) => getPluginOnSite( state, site, 'vaultpress' ) );

	// Install the plugin
	const dispatch = useDispatch();
	dispatch( installPlugin( plugin, site ) );
};
```

## Reducer

Data from the aforementioned actions is added to the global state tree, under `plugins.premium`, with the following structure:

```js
state.plugins.premium = {
	isRequesting: {
		exampleSiteId: false,
	},
	plugins: {
		exampleSiteId: [
			{
				slug: 'vaultpress',
				name: 'VaultPress',
				key: 'vp-api-key',
				status: 'wait',
				error: null,
			},
			{
				slug: 'akismet',
				name: 'Akismet',
				key: 'ak-api-key',
				status: 'wait',
				error: null,
			},
		],
	},
};
```
