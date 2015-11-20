TagListData
================

TagListData is a component which aims to ease interactions with the
[terms flux store and actions](../../../lib/terms) related to post tags.

## Usage

Use `<TagListData/>` to wrap a child component that will do the actual
rendering of the view.

```jsx
var React = require( 'react' ),
	TagListData = require( 'components/data/tag-list-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<TagListData siteId={ this.props.siteId }>
				<MyChildComponent />
			</TagListData>
		);
	}
} );
```

### Required Props

- `siteId`: The site you would like to get tag data for

## Results

The child component will receive the props outlined above, along with the following:

- `tags`: <Array> An ordered array of known tags for the site, or `undefined` if currently fetching data
- `tagsHasNextPage`: <Boolean> if another page of tag data can be fetched
- `tagsFetchingNextPage`: <Boolean> if another page is currently being fetched
