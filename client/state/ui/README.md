UI State
========

A module for managing user interface state.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `setSelectedSite( siteId: Number )`

Sets the currently selected site, by site ID.

```js
import { setSelectedSite } from 'state/ui/actions';

dispatch( setSelectedSite( 2916284 ) );
```

## Reducers

The included reducers add the following keys to the global state tree, under `ui`:

#### `selectedSite`

The currently selected site, or `null` if no site is selected.

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `getSelectedSite( state: Object )`

Returns the currently selected site object.

```js
import { getSelectedSite } from 'state/ui/selectors';

const selectedSite = getSelectedSite( store.getState() );
```
