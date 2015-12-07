State
=====

This directory contains all of the behavior describing the global application state. Folders within this directory reflect sub-trees within the global state tree, each with their own set of actions, reducers, and utilities.

The root module exports a single function which, when invoked, returns an instance of a [Redux store](http://redux.js.org/docs/basics/Store.html). The store instance runs dispatched actions against all known reducers. To include a reducer in the global store, simply add the reducing function to the combined reducer in `index.js`.

## Usage

```js
import { createReduxStore } from 'state';

const store = createReduxStore();
```
