Data Persistence
================

Persisting our Redux state to browser storage (IndexedDB) allows us to avoid completely rebuilding the
Redux tree from scratch on each page load and to display cached data in the UI (instead of placeholders)
while fetching the latest updates from the REST API is still in progress.

This feature was originally implemented in [#2754](https://github.com/Automattic/wp-calypso/pull/2754).

At a high level, implementing this is straightforward. We subscribe to any Redux store changes, and on change we update
our browser storage with the new state of the Redux tree. On page load, if we detect stored state in browser storage during
our initial render, we create our Redux store with that persisted initial state.

However we quickly run into the following problems:

#### Problem: Subtrees may contain class instances

Subtrees may contain class instances. In some cases this is expected, because certain branches have chosen to use
Immutable.js. Other branches use specialized classes like [QueryManager](https://github.com/Automattic/wp-calypso/tree/master/client/lib/query-manager)
whose instances are stored in Redux state. However, attempting to serialize class instances will throw errors while saving
to browser storage.

#### Solution: SERIALIZE and DESERIALIZE actions

To work around this we create two special action types: `SERIALIZE` and `DESERIALIZE`. These actions are not dispatched,
but are instead used with the reducer directly to prepare state to be serialized to browser storage, and for
deserializing persisted state to an acceptable initialState for the Redux store.

```javascript
reducer( reduxStore.getState(), { type: 'SERIALIZE' } )
```
and

```javascript
reducer( browserState, { type: 'DESERIALIZE' } )
```

Because browser storage is only capable of storing simple JavaScript objects, the purpose of the `SERIALIZE` action
type reducer handler is to return a plain object representation. In a subtree that uses Immutable.js it should be
similar to:
```javascript
export const items = createReducer( defaultState, {
	[THEMES_RECEIVE]: ( state, action ) => // ...
	[SERIALIZE]: state => state.toJS()
} );
```

In turn, when the store instance is initialized with the browser storage copy of state, you can convert
your subtree state back to its expected format from the `DESERIALIZE` handler. In a subtree that uses Immutable.js
instead of returning a plain object, we create an Immutable.js instance:
```javascript
export const items = createReducer( defaultState, {
	[THEMES_RECEIVE]: ( state, action ) => // ...
	[DESERIALIZE]: state => fromJS( state )
} );
```
If your reducer state can be serialized by the browser without additional work (eg a plain object, string or boolean),
the `SERIALIZE` and `DESERIALIZE` handlers are not needed. However, please note that the subtree can still see errors
from changing data shapes, as described below.

#### Problem: Data shapes change over time ( [#3101](https://github.com/Automattic/wp-calypso/pull/3101) )

As time passes, the shape of our data will change very drastically in our Redux store and in each subtree. If we now
persist state, we run into the issue of our persisted data shape no longer matching what the Redux store expects.

As a developer, this case is extremely easy to hit. If Redux persistence is enabled and we are running master, first
allow  state to be persisted to the browser and then switch to another branch that contains minor refactors for an
existing sub-tree. What happens when a selector reaches for a data property that doesn't exist or has been renamed?
Errors!

A normal user can hit this case too by visiting our website and returning two weeks later.

How can we tell that our persisted data is good to use as initial state?

#### Solution: Schema Validation

Before we can detect data shape changes, we need to be able to describe what our data looks like. To accomplish this,
we use [JSON Schema](http://json-schema.org/). JSON Schema is a well-known human and machine readable format that
defines the structure of JSON data. It is also easily adapted for use with plain JavaScript objects.

A schema file `schema.js` is added at the same level of each reducer. Our schema should aim to describe our data needs,
specifically: what the general shape looks like, which properties must be required, and what additional optional
properties they might contain. Ideally, we should try to balance readability and strictness.

A simple example schema.js:
```javascript
export const itemsSchema = {
	type: 'object',
	patternProperties: {
		'^\\d+$': {
			type: 'object',
			required: [ 'ID', 'name' ],
			properties: {
				ID: { type: 'number' },
				name: { type: 'string' },
				description: { type: 'string' },
		}
	},
	additionalProperties: false
};
```

A JSON Schema must be provided if the subtree chooses to persist state. If we find that our persisted data doesn't
match our described data shape, we should throw it out and rebuild that section of the tree with our default state.

When using `createReducer` util you can pass a schema as a third param and all that will be handled for you.
```javascript
export const items = createReducer( defaultState, {
	[THEMES_RECEIVE]: ( state, action ) => // ...
}, itemsSchema );
```

If you are not satisfied with the default handling, it is possible to implement your own `SERIALIZE` and
`DESERIALIZE` action handlers in your reducers to customize data persistence. Always use a schema with your custom
handlers to avoid data shape errors.

#### Problem: Some reducers are loaded dynamically

Dynamically loaded JS modules can add new reducers to the existing state tree. The state tree shape is therefore
not the same at all times. The initial reducer can be small and new reducers can be added as the user navigates to new
parts of the app and new code modules are loaded at runtime.

If we persist the state tree as one monolithic object, we run into trouble. To `DESERIALIZE` and check a stored
state subtree against a JSON schema, the corresponding reducer needs to be loaded and available.
It's therefore not possible to load such a state subtree during Calypso boot.

#### Solution: Store some state subtrees into separate IndexedDB keys

A reducer for a state subtree can have a `storageKey` property that is added using the `withStorageKey` helper:

```js
const readerReducer = withStorageKey( 'reader', combineReducers( {
  feeds,
	follows,
	streams,
	teams,
} );
```

When this `storageKey` property is encountered when dispatching the `SERIALIZE` action, the result of the serialization
will be an instance of the [SerializationResult](https://github.com/Automattic/wp-calypso/tree/master/client/state/serialization-result.js) class that contains two serialized objects. One for `root` key, with the state that doesn't have a `storageKey` set,
and another one for `reader` key. Both objects will be stored as two distinct rows in the IndexedDB table.

When booting Calypso, we initially load only the `root` stored state. The `reader` key is loaded and deserialized only
when the `reader` reducer is being added dynamically.

### Opt-in to Persistence ( [#13542](https://github.com/Automattic/wp-calypso/pull/13542) )

If we choose not to use `createReducer` we can opt-in to persistence by adding a schema as a property on the reducer.
We do this by combining all of our reducers using `combineReducers` from `state/utils` at every level of the tree instead
of the default implementation of [combineReducers](http://redux.js.org/docs/api/combineReducers.html) from `redux`.
Each reducer is then wrapped with `withSchemaValidation` which returns a wrapped reducer that validates on `DESERIALIZE`
if a schema is present and returns initial state on both `SERIALIZE` and `DESERIALIZE` if a schema is not present.

To opt-out of persistence we combine the reducers without any attached schema.
```javascript
return combineReducers( {
    age,
    height,
} );
```

To persist, we add the schema as a property on the reducer:
```javascript
age.schema = ageSchema;
return combineReducers( {
    age,
    height,
} );
```

For a reducer that has custom handlers (needs to perform transforms), we assume the reducer is checking the schema already,
on `DESERIALIZE` so all we need to do is set a boolean bit on the reducer, to ensure that we don't return initial state
incorrectly from the default handling provided by `withSchemaValidation`.
```javascript
date.hasCustomPersistence = true;
return combineReducers( {
    age,
    height,
    date,
} );
```

### Not persisting data

Some subtrees may choose to never persist data. One such example of this is our online connection state. If connection
values are persisted we will not be able to reliably tell when the application is offline or online. Please remember
to reason about if items should be persisted.
