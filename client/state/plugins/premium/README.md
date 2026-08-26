# Premium Plugins

A module for retrieving the registration keys of the premium plugins a Jetpack plan provides.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `fetchInstallInstructions( siteId: number )`

Get a list of premium plugins for a given site. Plugin information returned includes the registration keys.

```js
import { fetchInstallInstructions } from 'calypso/state/plugins/premium/actions';

fetchInstallInstructions( 106093271 );
```

## Reducer

Data from the aforementioned action is added to the global state tree, under `plugins.premium`, with the following structure:

```js
state.plugins.premium = {
	hasRequested: {
		exampleSiteId: true,
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
