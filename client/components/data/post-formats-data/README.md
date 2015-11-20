PostFormatsData
===============

PostFormatsData is a React component intended to be used as a controller-view to simplify binding and interacting with the [post formats Flux module](../../../lib/post-formats/).

## Usage

Wrap a child component with `<PostFormatsData />`, passing a `siteId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), PostFormatsData does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved for the site.

```jsx
var React = require( 'react' ),
	PostFormatsData = require( 'components/data/post-formats-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<PostFormatsData siteId={ this.props.siteId }>
				<MyChildComponent />
			</PostFormatsData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `postFormats`: An array of known post formats for the site, or `undefined` if data has not yet been fetched. Each post format is an object containing a `slug` and `label` value.
