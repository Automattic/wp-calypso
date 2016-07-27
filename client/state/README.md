State
=====

This directory contains all of the behavior describing the global application state. Folders within this directory reflect sub-trees of the global state tree, each with their own reducer, actions, and selectors.

The root module exports a single function which, when invoked, returns an instance of a [Redux store](http://redux.js.org/docs/basics/Store.html). The store instance runs dispatched actions against all known reducers. To include a reducer in the global store, simply add the reducing function to the combined reducer in `index.js`.

## Usage

```js
import { createReduxStore } from 'state';

const store = createReduxStore();
```

## Adding to the tree

All the application information and data in Calypso should go through this data flow. When you are creating a new module with new data requirements, you should add them to this global store.

## Utilities

`state/utils.js` contains a number of helper utilities you may find useful in implementing your state subtree:

### extendAction( action, data )

Use `extendAction` to leverage the behavior of an existing action creator, extending any dispatched action via the original action creator with the provided data object. By using this helper, you avoid unnecessarily duplicating the original logic or tying the original action creator to your new (presumably optional) requirements. This is the equivalent of calling `Object.assign` on a plain-object action creator result, but also accepts an action thunk for which action objects should be extended.

__Example:__

```js
function original() {
	return ( dispatch ) => {
		dispatch( { type: 'example' } );
		dispatch( { type: 'example' } );
	};
}

function extended() {
	return extendAction( original(), { extended: true } );
}

dispatch( extended() );
// Dispatches two actions `{ type: 'example', extended: true }`
```
