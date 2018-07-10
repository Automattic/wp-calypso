withState
=========

`withState` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) which enables a function component to have internal state.

Wrapping a component with `withState` provides state as props to the wrapped component, along with a `setState` updater function.

## Usage

```jsx
/**
 * WordPress dependencies
 */
import { withState } from '@wordpress/components';

function MyCounter( { count, setState } ) {
	return (
		<>
			Count: { count }
			<button onClick={ () => setState( ( state ) => ( { count: state.count + 1 } ) ) }>
				Increment
			</button>
		</>
	);
}

export default withState( {
	count: 0,
} )( MyCounter );
```

`withState` optionally accepts an object argument to define the initial state. It returns a function which can then be used in composing your component.
