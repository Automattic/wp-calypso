CategorySelector
================

The `CategorySelector` component renders a list of Categories along with a search box for filtering.  The component was designed to be used as a child component of the [CategoryListData](../../components/data/category-list-data) view controller which handles interactions with the [CategoryStore](../../lib/terms/category-store.js) and [TermActions](../../lib/terms/actions.js).

## Usage
An example of using `CategorySelector` as a child component of `CategoryList`:

```jsx
var CategorySelector = require( 'my-sites/category-selector' ),
	CategoryListData = require( 'components/data/category-list-data' );

<CategoryListData siteId={ this.props.siteId } search={ this.state.searchTerm } >
	<CategorySelector
		onChange={ <function> }
		onSearch={ <function> }
		selected={ <array> }>
	</CategorySelector>
</CategoryListData>
```

### Required Props
- `siteId (Number)` - The ID of the site to load categories for.
- `categories (Array)` - An array of category objects, supplied by `CategoryListData`
- `categoriesFound (Number)` - The total number of categories for the site, supplied by `CategoryListData`
- `categoriesHasNextPage (Boolean)` - Truthy if there is another page that can be fetched, supplied by `CategoryListData`
- `categoriesFetchingNextPage (Boolean)` - Truthy if there is an in-flight API request for more category data, supplied by `CategoryListData`
- `categoriesFetchNextPage (Function)` - A function that will trigger a fetch of the next page of category data, supplied by `CategoryListData`
- `createLink (String)` - Link to create a new category. This will be shown if no categories exist, or no results are found in a search.
- `onChange (Function)` - A function that is called when a category item is checked/unchecked. The associated Category Item is supplied as an argument.
- `selected (Array)` - An array of category objects that should be selected/checked. Objects must have an `ID` attribute with the category ID, or be a simple array of category ID's.

### Optional Props
- `multiple (Boolean)` - Truthy if you would like to allow multiple categories to be selected. If false, a radio group is displayed.
- `className (String)` - A className to be applied to the wrapper div for custom styling needs.
- `children (ReactElement)` - Child React Elements may also be wrapped by `CategorySelector` and will be shown _above_ the selector and search box.
- `analyticsPrefix (String)` - The prefix that will be used when recording GA events.
- `searching (Boolean)` - Whether a search term has been entered.
- `searchThreshold (Number)` - Used to determine if the search box is shown. Defaults to 8 (the search box is only shown when there are more than 8 categories).
- `defaultCategoryId (Number)` - ID of the default category to select.
