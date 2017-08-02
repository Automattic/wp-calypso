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

### keyedReducer( keyName, reducer )

Sometimes we have a collection of properties that represent some object or data item and our reducers contain a collection of those items.
For example, we may have a list of widgets for a site, but our reducer keeps a collection of those sites.

It's fairly common to see reducers built like this:

```js
const widgetCount = ( state = {}, action ) => {
	if ( ADD_WIDGET === action.type ) {
		return {
			...state,
			[ action.siteId ]: state[ action.siteId ] + 1,
		}
	}

	return state;
}
```

Notice that the reducer _wants_ to operate on a simple integer, but because it has to store a collection of these things, identified by which `siteId` it belongs to, we have a complicated initial state and confusing syntax on the return value.

What if we could write them like this instead…

```js
const widgetCount = ( state = 0, action ) => {
	if ( ADD_WIDGET === action.type ) {
		return state + 1;
	}

	return state;
}
```

…and somehow it would know to assign this to the proper site?

This utility helper provides the glue for us to allow this style of reducer composition. It creates a reducer for a collection of items which are identified by some key. In our case, we can create it with the `siteId` of the action as the key.

```js
export default keyedReducer( 'siteId', widgetCount );
```

This will automatically search for a `siteId` property in the action and dispatch the update to the appropriate item in the collection.
Unlike building a reducer without this helper, the updates will only apply to the item in the collection with the given key.

By using this helper we can keep our reducers small and easy to reason about.
They automatically benefit from the way `combineReducers` will immutably update the state, wherein if no changes actually occur then no updates will follow.
We are left with simple update expressions that are decoupled from the rest of the items in the collection.
We are provided the opportunity to make straightforward tests without complicated mocks.

#### Example

```js
const age = ( state = 0, action ) =>
    GROW === action.type
        ? state + 1
        : state

const title = ( state = 'grunt', action ) =>
    PROMOTION === action.type
        ? action.title
        : state

const userReducer = combineReducers( {
    age,
    title,
} )

export default keyedReducer( 'username', userReducer )

dispatch( { type: GROW, username: 'hunter02' } )

state.users === {
    hunter02: {
        age: 1,
        title: 'grunt',
    }
}
```

### withSchemaValidation( schema, reducer )

When Calypso boots up it loads the last-known state out of persistent storage in the browser.
If that state was saved from an old version of the reducer code it could be incompatible with the new state model.
Thankfully we are given the ability to validate the schema and conditionally load the persisted state only if it's valid.
This can be done by passing a schema into a call to `createReducer()`, but sometimes `createReducer()` provides more abstraction than is necessary.

This helper produces a new reducer given an original reducer and schema.
The new reducer will automatically validate the persisted state when Calypso loads and reinitialize if it isn't valid.
It is in most regards a lightweight version of `createReducer()`.

#### Example

```js
const ageReducer = ( state = 0, action ) =>
	GROW === action.type
		? state + 1
		: state

const schema = { type: 'number', minimum: 0 }

export const age = withSchemaValidation( schema, ageReducer )

ageReducer( -5, { type: DESERIALIZE } ) === -5
age( -5, { type: DESERIALIZE } ) === 0
age( 23, { type: DESERIALIZE } ) === 23
```
