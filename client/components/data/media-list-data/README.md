MediaListData
=============

MediaListData is a React component intended to be used as a controller-view to simplify binding and interacting with the [media stores and actions](../../../lib/media/).

## Usage

Wrap a child component with `<MediaListData />`, passing a `siteId` and optional `filter` and `search` values. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), MediaListData does not render any content of its own; instead, it simply renders the child component.

```jsx
var React = require( 'react' ),
	MediaListData = require( 'components/data/media-list-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<MediaListData siteId={ this.props.siteId }>
				<MyChildComponent />
			</MediaListData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `media`: An ordered array of known media items for the site, or `undefined` if currently fetching data
- `mediaHasNextPage`: A boolean indicating whether more media items exist for the site
- `mediaFetchingNextPage`: A boolean indicating whether the next page of media items is being fetched
- `mediaOnFetchNextPage`: A function to invoke when more media items are desired
