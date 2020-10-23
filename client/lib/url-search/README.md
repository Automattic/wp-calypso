# url-search

`url-search` ties a search component to an `s` querystring parameter, like `wordpress.com/posts?s=example`. This is useful to persist search result pages in the browser history[\*](#history) and to make search result pages shareable.

The `url-search` higher-order component takes the approach of only using state to track whether the search field should be open, and otherwise communicating the value of new searches by updating the URL, where the controller can read the value and use it to call whatever data is necessary, and then also pass it back into the Search component as initialValue.

## Usage

To use this higher-order component, take any component that _contains_ the search component, e.g., `/my-sites/posts/posts.jsx` and enhance it with urlSearch.

In your controller method, retrieve the search parameter from the URL and pass that into the component as a `search` prop. You also need to pass the context object itself into the component:

```js
const search = qs.parse( context.querystring ).s;

ReactDom.render(
	PostsComponent( {
		search,
		context,
	} ),
	document.getElementById( 'primary' )
);
```

Then in the component file, enhance with `urlSearch`:

```js
/**
 * Internal dependencies
 */
import urlSearch from 'calypso/lib/url-search';

class SomeComponentWithSearch extends Component {
	/*...*/
}

export default urlSearch( SomeComponentWithSearch );
```

Then within your render method, apply the following properties to the `Search` component; `onSearch` and `initialValue`.

```jsx
function render() {
	return <Search onSearch={ this.props.doSearch } initialValue={ this.props.search } delaySearch />;
}
```

_If_ your search component should only be displayed dynamically, you can use `this.getSearchOpen()` to determine whether the search should be open or closed, like so:

```jsx
function render() {
	const containerClass = classNames( {
		'search-open': this.props.getSearchOpen(),
	} );

	return (
		<div classNames={ containerClass }>
			<Search onSearch={ this.props.doSearch } initialValue={ this.props.search } delaySearch />
		</div>
	);
}
```

## History

`url-search` adds the first search result page to the browser history, and then uses push-state to update the page on subsequent searches. So only the most-recent search is persisted in the browser's history.
