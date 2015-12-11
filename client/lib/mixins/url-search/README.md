url-search
=============

`url-search` ties a search component to an `s` querystring parameter, like `wordpress.com/posts?s=example`. This is useful to persist search result pages in the browser history[*](#history) and to make search result pages shareable.

The `url-search` mixin takes the approach of only using state to track whether the search field should be open, and otherwise communicating the value of new searches by updating the URL, where the controller can read the value and use it to call whatever data is necessary, and then also pass it back into the Search component as initialValue.

You would add this mixin to the component that _contains_ the search component, e.g., `/my-sites/posts/posts.jsx`.

In your controller method, retrieve the search parameter from the URL and pass that into the component as a `search` prop. You also need to pass the context object itself into the component:

```
var search = search = qs.parse( context.querystring ).s;

ReactDom.render(
	PostsComponent({
		search: search,
		context: context
	}),
	document.getElementById( 'primary' )
);
```

Then in the component, apply the mixin:

```
/**
 * Internal dependencies
 */

var URLSearch = require( 'lib/mixins/url-search' );

module.exports = React.createClass({

	displayName: 'Posts',

	mixins: [ URLSearch ],
```

Then within your render method, apply the following properties to the `Search` component; `onSearch`, `initialValue`, and `ref` (with a value of "url-search").

```
	render: function() {

		return (
			<Search onSearch={ this.doSearch } initialValue={ this.props.search } delaySearch={ true } ref="url-search"/>
		);
```

_If_ your search component should only be displayed dynamically, you can use `this.getSearchOpen()` to determine whether the search should be open or closed, like so:

```
	render: function() {

		var containerClass = classNames( {
			'search-open': this.getSearchOpen()
		} );

		return (
			<div class={ containerClass } >
				<Search onSearch={ this.doSearch } initialValue={ this.props.search } delaySearch={ true } ref="url-search"/>
			</div>
		);
```

## History
`url-search` adds the first search result page to the browser history, and then uses push-state to update the page on subsequent searches. So only the most-recent search is persisted in the browser's history.
