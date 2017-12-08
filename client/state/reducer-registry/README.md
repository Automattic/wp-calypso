Reducer Registry
================

The reducer registry allows us to load additional reducers into an original reducer, created by the usual `combineReducers`. It does that by implementing a special version of the same function, named `combineReducersAndAddLater`.

To load additional reducers, call `addReducers` and pass the object containing the reducers, with the registry name already set.

A little redux enhancer is implemented for the sole purpose of getting a hold of the global Redux store.

To work with persistent states, `combineReducersAndAddLater` keeps the state tree inside a `_initialState` property when it couldn't find a reducer for the key, as opposed to removing the state altogether. When the reducer matching the key is loaded, the serialized state held by the property will get passed into the loaded reducer so that it can be properly deserialized, and/or validated with the schema. This is achieved by calling a placeholder reducer whenever a reducer matching the key is unfound. The same placeholder reducer also properly "serialize" the state by returning the state held by the `_initialState` property.

It's worthy to point out the reducer returned from `combineReducersAndAddLater` is a non-pure function, since it depends on the reducers added from somewhere else, with `addReducers`.

__Example:__

```js
import { combineReducersAndAddLater } from 'state/reducer-registry';
const fooReducer = combineReducersAndAddLater({ reducer1, reducer2 }, 'foo' );
```

With that you can add more reducers into the original collection:

```js
import { addReducers } from 'state/reducer-registry';
addReducers( { reducer3, reducer4 }, 'foo' );
```