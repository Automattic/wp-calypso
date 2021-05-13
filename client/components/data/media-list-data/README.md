# MediaListData

MediaListData is a React component intended to be used as a controller-view to simplify binding and interacting with the [media stores and actions](../../../lib/media/).

## Usage

Wrap a child component with `<MediaListData />`, passing a `siteId` and optional `filter`, `postId` and `search` values. [As a controller-view](https://facebook.github.io/flux/docs/overview.html#views-and-controller-views), MediaListData does not render any content of its own; instead, it simply renders the child component.

```jsx
import React from 'react';
import MediaListData from 'calypso/components/data/media-list-data';
import MyChildComponent from './my-child-component';

export default class extends React.Component {
	static displayName = 'MyComponent';

	render() {
		return (
			<MediaListData siteId={ this.props.siteId }>
				<MyChildComponent />
			</MediaListData>
		);
	}
}
```

The child component should expect to receive any props defined during the render, as well as the following additional props:

- `media`: An ordered array of known media items for the site, or `undefined` if currently fetching data
- `mediaHasNextPage`: A boolean indicating whether more media items exist for the site
- `mediaOnFetchNextPage`: A function to invoke when more media items are desired
