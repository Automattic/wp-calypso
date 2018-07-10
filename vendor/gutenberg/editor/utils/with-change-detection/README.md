withChangeDetection
===================

`withChangeDetection` is a [Redux higher-order reducer](http://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers) for tracking changes to reducer state over time.

It does this based on the following assumptions:

- The original reducer returns an object
- The original reducer returns a new reference only if a change has in-fact occurred

Using these assumptions, the enhanced reducer returned from `withChangeDetection` will include a new property on the object `isDirty` corresponding to whether the original reference of the reducer has ever changed.

Leveraging a `resetTypes` option, this can be used to mark intervals at which a state is considered to be clean (without changes) and dirty (with changes).

## Example

Considering a simple count reducer, we can enhance it with `withChangeDetection` to reflect whether changes have occurred:

```js
function counter( state = { count: 0 }, action ) {
	switch ( action.type ) {
		case 'INCREMENT':
			return { ...state, count: state.count + 1 };
	}

	return state;
}

const enhancedCounter = withChangeDetection( counter, { resetTypes: [ 'RESET' ] } );

let state;

state = enhancedCounter( undefined, {} );
// { count: 0, isDirty: false }

state = enhancedCounter( state, { type: 'INCREMENT' } );
// { count: 1, isDirty: true }

state = enhancedCounter( state, { type: 'RESET' } );
// { count: 1, isDirty: false }
```
