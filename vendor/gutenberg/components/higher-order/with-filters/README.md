withFilters
==============

`withFilters` is a part of [Native Gutenberg Extensibility](https://github.com/WordPress/gutenberg/issues/3330). It is also a React [higher-order component](https://facebook.github.io/react/docs/higher-order-components.html).

Wrapping a component with `withFilters` provides a filtering capability controlled externally by the `hookName`.

## Usage

```jsx
/**
 * WordPress dependencies
 */
import { withFilters } from '@wordpress/components';

function MyCustomElement() {
	return (
		<div>
			content
		</div>
	);
}

export default withFilters( 'MyCustomElement' )( MyCustomElement );
```

`withFilters` expects a string argument which provides a hook name. It returns a function which can then be used in composing your component. The hook name allows plugin developers to customize or completely override the component passed to this higher-order component using `wp.hooks.addFilter` method.
