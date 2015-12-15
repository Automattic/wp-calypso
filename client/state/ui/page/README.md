Page State
==========

A module for managing page state. Page state is defined as a key-value map with the intended lifetime of a single page view. In the context of a single-page application, it's assumed that a universal route handler will reset the state on each route change.

## Actions

Used in combination with the Redux store instance `dispatch` function, actions can be used in manipulating the current global state.

### `setPageState( key, value )`

Sets a page state value by key.

```js
import { setPageState } from 'state/ui/page/actions';

dispatch( setPageState( 'filter', 'videos' ) );
```

## Selectors

Selectors are intended to assist in extracting data from the global state tree for consumption by other modules.

#### `getPageState( state, key )`

Returns the current page state value for the given key.

```js
import { getPageState } from 'state/ui/selectors';

const filter = getPageState( store.getState(), 'filter' );
```
