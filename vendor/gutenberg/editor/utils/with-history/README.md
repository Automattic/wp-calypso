withHistory
===========

`withHistory` is a [Redux higher-order reducer](http://redux.js.org/docs/recipes/reducers/ReusingReducerLogic.html#customizing-behavior-with-higher-order-reducers) for tracking the history of a reducer state over time. The enhanced reducer returned from `withHistory` will return an object shape with properties `past`, `present`, and `future`. The `present` value maintains the current value of state returned from the original reducer. Past and future are respectively maintained as arrays of state values occurring previously and future (if history undone).

Leveraging a `resetTypes` option, this can be used to mark intervals at which a state history should be reset, emptying the values of the `past` and `future` arrays.

History can be adjusted by dispatching actions with type `UNDO` (reset to the previous state) and `REDO` (reset to the next state).

## Example

Considering a simple count reducer, we can enhance it with `withHistory` to track value over time:

```js
function counter( state = { count: 0 }, action ) {
	switch ( action.type ) {
		case 'INCREMENT':
			return { ...state, count: state.count + 1 };
	}

	return state;
}

const enhancedCounter = withHistory( counter, { resetTypes: [ 'RESET' ] } );

let state;

state = enhancedCounter( undefined, {} );
// { past: [], present: 0, future: [] }

state = enhancedCounter( state, { type: 'INCREMENT' } );
// { past: [ 0 ], present: 1, future: [] }

state = enhancedCounter( state, { type: 'UNDO' } );
// { past: [], present: 0, future: [ 1 ] }

state = enhancedCounter( state, { type: 'REDO' } );
// { past: [ 0 ], present: 1, future: [] }

state = enhancedCounter( state, { type: 'RESET' } );
// { past: [], present: 1, future: [] }
```
