lib/store
=========

Helpers to create and combine Flux stores.

These are inspired by [Redux] patterns such as reducer stores and reducer composition.

#### `createReducerStore`

Create a traditional Flux store from a Redux-style (`(state, action)`) reducer. Optionally takes an `initialState` object. See inline JSDoc for details.

#### `combineStores`

Combine multiple Flux stores into a single one. See inline JSDoc for details.

* * *

Combined together, these helpers allow us to build drop-in wrappers to help with the transition to a Redux-based architecture.

[redux]: http://redux.js.org/
