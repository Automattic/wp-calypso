`create-redux-store`
====================

This module exports a function which, when invoked, returns an instance of a [Redux store](http://redux.js.org/docs/basics/Store.html). The store instance is intended to reflect the global state of the application, and runs dispatched actions against all reducers defined in [`reducers.js`](./reducers.js). To include a reducer in the global store, simply add the reducing function to the combined reducer exported by `reducers.js`.

## Usage

```js
import createReduxStore from 'lib/create-redux-store';

const store = createReduxStore();
```
