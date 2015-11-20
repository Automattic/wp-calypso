MediaValidationData
===================

MediaValidationData is a React component intended to be used as a controller-view to simplify binding and interacting with the [media validation store](../../../lib/media/validation-store.js).

## Usage

Wrap a child component with `<MediaValidationData />`, passing a `siteId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), MediaValidationData does not render any content of its own; instead, it simply renders the child component.

```jsx
var React = require( 'react' ),
	MediaValidationData = require( 'components/data/media-validation-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<MediaValidationData siteId={ this.props.siteId }>
				<MyChildComponent />
			</MediaValidationData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `mediaValidationErrors`: An object of key value pairs, where the key is an item ID and the value is an array of errors for that media item.
