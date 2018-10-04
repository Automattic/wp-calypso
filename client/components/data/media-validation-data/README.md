MediaValidationData
===================

MediaValidationData is a React component intended to be used as a controller-view to simplify binding and interacting with the [media validation store](../../../lib/media/validation-store.js).

## Usage

Wrap a child component with `<MediaValidationData />`, passing a `siteId`. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), MediaValidationData does not render any content of its own; instead, it simply renders the child component.

```jsx
import React from 'react';
import MediaValidationData from 'components/data/media-validation-data';
import MyChildComponent from './my-child-component';

export default class extends React.Component {
	static displayName = 'MyComponent';

	render() {
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
