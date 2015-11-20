MediaLibrarySelectedData
========================

MediaLibrarySelectedData is a React component intended to be used as a controller-view to simplify binding and interacting with the [media library selected store](../../../lib/media/library-selected-store.js).

## Usage

Wrap a child component with `<MediaLibrarySelectedData />`, passing a `siteId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), MediaLibrarySelectedData does not render any content of its own; instead, it simply renders the child component.

```jsx
var React = require( 'react' ),
	MediaLibrarySelectedData = require( 'components/data/media-library-selected-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<MediaLibrarySelectedData siteId={ this.props.siteId }>
				<MyChildComponent />
			</MediaLibrarySelectedData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `mediaLibrarySelectedItems`: An array of media items which are selected in the media library.
