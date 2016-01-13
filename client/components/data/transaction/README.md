CartData
========

`TransactionData` is a React component intended to be used as a controller-view to simplify binding and interacting with the [transaction Flux module](../../../lib/transaction/).

## Usage

Wrap a child component with `<TransactionData />`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), TransactionData does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved for the site.

```jsx
var React = require( 'react' ),
	TransactionData = require( 'components/data/transaction' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<TransactionData>
				<MyChildComponent />
			</TransactionData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render.
