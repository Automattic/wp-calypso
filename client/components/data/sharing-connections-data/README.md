SharingConnectionsData
======================

SharingConnectionsData is a React component intended to be used as a controller-view to simplify binding and interacting with the [`connections-list` module](../../../lib/connections-list/).

## Usage

Wrap a child component with `<SharingConnectionsData />`, passing a `siteId` and optional `userId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), SharingConnectionsData does not render any content of its own; instead, it simply renders the child component. When mounted, the component will automatically trigger a network request for data if data hasn't yet been retrieved for the site.

```jsx
var React = require( 'react' ),
	SharingConnectionsData = require( 'components/data/sharing-connections-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<SharingConnectionsData siteId={ this.props.siteId }>
				<MyChildComponent />
			</SharingConnectionsData>
		);
	}
} );
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `connections`: An array of known connections for the site, or `undefined` if data has not yet been fetched

## Props

### `siteId`

Required. The site ID for which the connections should be retrieved.

### `userId`

Optional. If omitted, connections will be filtered to those available for the current user. Otherwise, you can pass an explicit user ID to limit connections to those available to a specific user, or pass `null` to include all connections available for a site.
