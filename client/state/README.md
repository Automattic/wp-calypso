# State

This directory contains all of the behavior describing the global application state. Folders within this directory reflect sub-trees of the global state tree, each with their own reducer, actions, and selectors.

The root module exports a single function which, when invoked, returns an instance of a [Redux store](http://redux.js.org/docs/basics/Store.html). The store instance runs dispatched actions against all known reducers.

## Modularized state

Calypso started off with a monolithic state approach, following the guidelines of the Redux project. To include a reducer in the global store, you would simply add the reducing function to the combined reducer in `index.js`, which would effectively load all reducers ahead of time. However, Calypso state has reached a scale where there are significant benefits in breaking up state loading, making it take place as the user navigates the application, rather than entirely upfront.

As such, Calypso now implements a modularized state approach, where reducers can be registered on demand. Each modularized portion of state has an `init` file that takes care of registration through a side effect. For example, for `reader`:

```js
import { registerReducer } from 'calypso/state/redux-store';
import reducer from './reducer';

registerReducer( [ 'reader' ], reducer );
```

This `init` file is then imported on every selector and action creator module that makes use of `reader` state:

```js
import 'calypso/state/reader/init';

function getStream( state, streamKey ) {
	return state.reader.streams[ streamKey ] || emptyStream;
}
```

This way, registration happens automatically as part of resolving the dependency graph, and state gets distributed across chunks through the regular build process, without any manual input.

In order to centralize state, it's recommended that all reducers, selectors and action creators for a given portion of state live under the corresponding directory in `client/state/<name>`. Selectors that access multiple parts of state should live under `client/state/selectors`.

There is currently an ongoing migration effort in modularizing all of Calypso state, following the approach above. Over time, the number of statically loaded reducers in `index.js` will go down, until we reach an empty set and handle all state loading through the modularized approach.

## Usage

```js
import { createReduxStore } from 'calypso/state';

const store = createReduxStore();
```

## Adding to the tree

All the application information and data in Calypso should go through this data flow. When you are creating a new module with new data requirements, you should add them to this global store.

## Utilities

`state/utils.js` contains a number of helper utilities you may find useful in implementing your state subtree:

### extendAction( action, data )

Use `extendAction` to leverage the behavior of an existing action creator, extending any dispatched action via the original action creator with the provided data object. By using this helper, you avoid unnecessarily duplicating the original logic or tying the original action creator to your new (presumably optional) requirements. This is the equivalent of calling `Object.assign` on a plain-object action creator result, but also accepts an action thunk for which action objects should be extended.

**Example:**

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
		};
	}

	return state;
};
```

Notice that the reducer _wants_ to operate on a simple integer, but because it has to store a collection of these things, identified by which `siteId` it belongs to, we have a complicated initial state and confusing syntax on the return value.

What if we could write them like this instead…

```js
const widgetCount = ( state = 0, action ) => {
	if ( ADD_WIDGET === action.type ) {
		return state + 1;
	}

	return state;
};
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
const age = ( state = 0, action ) => ( GROW === action.type ? state + 1 : state );

const title = ( state = 'grunt', action ) => ( PROMOTION === action.type ? action.title : state );

const userReducer = combineReducers( {
	age,
	title,
} );

export default keyedReducer( 'username', userReducer );

dispatch( { type: GROW, username: 'hunter02' } );

state.users ===
	{
		hunter02: {
			age: 1,
			title: 'grunt',
		},
	};
```

**NOTE:** There may be some cases where you wish to respond to an action by removing a key. In those cases, you may return `undefined` from the reducer to explicitly indicate there is no longer state associated with the key, and `keyedReducer` will omit that key from the state.

#### Example

```javascript
const deleteableUserReducer = ( state, action ) =>
	DELETE === action.type ? undefined : userReducer( state, action );

export default keyedReducer( 'username', deleteableUserReducer );

state.users ===
	{
		hunter02: {
			age: 1,
			title: 'grunt',
		},
	};

dispatch( { type: DELETE, username: 'hunter02' } );

state.users === {};
```

Finally, it's sometimes desirable to apply specific actions to all items in the collection.
In these cases we can tell the `keyedReducer` which actions are in this class.
Even without the necessary key in the action they will still get applied.
For example, each item may have a custom persistence need or an action may have related data which is applicable to the items being reduced in this collection.

For these cases we can simply add in a list of global action types.

```js
const hexPersister = ( state = 0, { type } ) => {
	switch ( type ) {
		case INCREMENT:
			return state + 1;

		case DECREMENT:
			return state - 1;

		case DESERIALIZE:
			return parseInt( state, 16 );

		case SERIALIZE:
			return state.toString( 16 );

		default:
			return state;
	}
};

const hexNumbers = keyedReducer( 'counterId', hexPersister, [ DESERIALIZE, SERIALIZE ] );
hexNumbers.hasCustomPersistence = true;
```

### withSchemaValidation( schema, reducer )

When Calypso boots up it loads the last-known state out of persistent storage in the browser.
If that state was saved from an old version of the reducer code it could be incompatible with the new state model.
Thankfully we are given the ability to validate the schema and conditionally load the persisted state only if it's valid.

This helper produces a new reducer given an original reducer and schema.
The new reducer will automatically validate the persisted state when Calypso loads and reinitialize if it isn't valid.

#### Example

```js
const ageReducer = ( state = 0, action ) => ( GROW === action.type ? state + 1 : state );

const schema = { type: 'number', minimum: 0 };

export const age = withSchemaValidation( schema, ageReducer );

ageReducer( -5, { type: DESERIALIZE } ) === -5;
age( -5, { type: DESERIALIZE } ) === 0;
age( 23, { type: DESERIALIZE } ) === 23;
```
