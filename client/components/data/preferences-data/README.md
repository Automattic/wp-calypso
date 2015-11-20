PreferencesData
===============

PreferencesData is a React component intended to be used as a controller-view to simplify binding and interacting with the [preferences Flux module](../../../lib/preferences/).

## Usage

Wrap a child component with `<PreferencesData />`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), PreferencesData does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved.

```jsx
var React = require( 'react' ),
	PreferencesData = require( 'components/data/preferences-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<PreferencesData>
				<MyChildComponent />
			</PreferencesData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `preferences`: An object of known preferences, or `undefined` if data has not yet been fetched.
