# Sites

A module for managing site data.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `receiveSite( site: Object )`

Adds a site object to the set of known sites.

```js
import { receiveSite } from 'calypso/state/sites/actions';

dispatch( receiveSite( { ID: 2916284, name: 'WordPress.com Example Blog' } ) );
```

## Reducers

The included reducers add the following keys to the global state tree, under `sites`:

### `items`

All known sites, indexed by site ID.

### `plans`

The available plans for a given site, indexed by site ID. See [this README](./plans/README.md) for more information.
