CategoryListData
================

CategoryListData is a component which aims to ease interactions with the
[terms flux store and actions](../../../lib/terms) related to post categories.

## Usage

Use `<CategoryListData/>` to wrap a child component that will do the actual
rendering of the view.

```jsx
var React = require( 'react' ),
	CategoryListData = require( 'components/data/category-list-data' ),
	MyChildComponent = require( './my-child-component' );

module.exports = React.createClass( {
	displayName: 'MyComponent',

	render: function() {
		return (
			<CategoryListData siteId={ this.props.siteId }>
				<MyChildComponent />
			</CategoryListData>
		);
	}
} );
```

### Required Props

- `siteId`: The site you would like to get category data for

### Optional Props

- `search`: A search string to filter the category store by

## Results

The child component will receive the props outlined above, along with the following:

- `categories`: <Array> An ordered array of known categories for the site, or `undefined` if currently fetching data
- `categoriesFound`: <Number> The `found` figure returned by the API which represents the total number of categories
- `categoriesHasNextPage`: <Boolean> if another page of category data can be fetched
- `categoriesFetchingNextPage`: <Boolean> if another page is currently being fetched
- `categoriesOnFetchNextPage`: <Function> a function to call when more category items are needed
