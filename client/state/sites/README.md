Sites
=====

A module for managing site data.

__Note:__ This module does not yet have complete feature parity with [`sites-list`](../../lib/sites-list). Refer to the set of actions and reducers below to determine whether your needs are satisfied. If not, consider adding support to the module, or use `sites-list` instead.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `receiveSite( site: Object )`

Adds a site object to the set of known sites.

```js
import { receiveSite } from 'state/sites/actions';

dispatch( receiveSite( { ID: 2916284, name: 'WordPress.com Example Blog' } ) );
```

## Reducers

The included reducers add the following keys to the global state tree, under `sites`:

#### `items`

All known sites, indexed by site ID.
