Preferences
===========

Preferences is a key-value store intended for use in cases where user preferences should be saved between browser sessions. The store itself is modelled as a Flux store, and actions are made available to externally interact with the store. Preferences are persisted to the WordPress.com REST API `/me/settings` endpoint.

The Preferences store extends the EventEmitter interface and can be monitored for changes by binding to the `change` event.

## Usage

The store is a singleton object which offers `get` and `getAll` methods to retrieve data from the store.

```js
import PreferencesStoreFactory from 'lib/preferences/store' );

const PreferencesStore = PreferencesStoreFactory();
const allPreferences = PreferencesStore.getAll();
const singlePreference = PreferenceStore.get( 'media-scale' );
```

To interact with the store, use the actions made available in `actions.js`.

```js
import PreferencesActions from 'lib/preferences/actions';

PreferencesActions.fetch();

PreferencesActions.set( 'media-scale', 0.75 );
```

You should monitor the store for changes in case another module interacts with the store:

```js
import PreferencesStoreFactory from 'lib/preferences/store' );

const PreferencesStore = PreferencesStoreFactory();
let mediaScale = PreferencesStore.get( 'media-scale' );

PreferencesStore.on( 'change', () => {
	mediaScale = PreferencesStore.get( 'media-scale' )
} );
```
