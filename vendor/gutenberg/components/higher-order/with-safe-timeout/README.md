withSafeTimeout
===============

`withSafeTimeout` is a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html) which provides a special version of `window.setTimeout` which respects the original component's lifecycle. Simply put, a function set to be called in the future via `setTimeout` will never be called if the original component instance ceases to exist in the meantime.

## Usage

```jsx
/**
 * WordPress dependencies
 */
import { withSafeTimeout } from '@wordpress/components';

function MyEffectfulComponent( { setTimeout } ) {
	return (
		<TextField
			onBlur={ () => {
				setTimeout( delayedAction, 0 );
			} }
		/>
	);
}

export default withSafeTimeout( MyEffectfulComponent );
```
