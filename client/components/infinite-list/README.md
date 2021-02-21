# Infinite Scroll List

An infinitely scrollable list, not rendering invisible items above and below viewport to reduce memory usage.
Important mainly for low end mobile devices.

## When to use

There is simpler implementation of infinite scroll - the [InfiniteScroll](../infinite-scroll/) component. Use `InfiniteList` when:

- items contain images or other media
- you expect that user will scroll a lot

## Props

- `items` Array of all items in list
- `lastPage` Boolean, if last page of list was fetched
- `fetchingNextPage` Boolean, if we are currently fetching more items
- `guessedItemHeight` Number, height to be used when real rendered height is unknown
- `itemsPerRow` Number (default: `1`), number of items per row if rendered as rows of items
- `fetchNextPage` Function, called to trigger loading of next page, takes `options` as argument, described below
- `getItemRef` Function, for given item returns string usable as React `key` and `ref`
- `renderItem` Function, for given item gets its React component. Render _must_ sets `ref` and `key` using `getItemRef`.
- `renderLoadingPlaceholders` Function, returning array of react components to be appended to list to indicate loading state.
- `renderTrailingItems` Function, returning markup to be rendered after the content items. Optional, useful for padding flexbox grid with invisible elements.
- `context` Object, DOM node in which the content is to be monitored for scroll state (optional, defaults to window if omitted or set to `false`)

All other props will be passed to the `div` which holds the list. This allows to set e.g. `className` for it.

## Analytics tracking

If you need to track when user scrolls to another page, do it in `fetchNextPage` method. The method accepts an object with one key, `triggeredByScroll`, which signals if fetching page is a response to user action, or the mixin trying to automatically fill available space. This is to prevent tracking analytics event for cases where more than one page fits to screen.

## Example Usage

```jsx
class Listing extends React.Component {
	fetchNextPage( options ) {
		if ( options.triggeredByScroll ) {
			// track analytics events
		}
		actions.fetchNextPage();
	}

	getItemRef( item ) {
		return 'item-' + item.id;
	}

	renderItem( item ) {
		const itemKey = this.getItemRef( item );
		return <Item ref={ itemKey } key={ itemKey } />;
	}

	renderLoadingPlaceholders() {
		const count = this.props.list.get().length ? 2 : this.props.list.perPage;
		const placeholders = [];
		times( count, function ( i ) {
			placeholders.push( <PostPlaceholder key={ 'placeholder-' + i } /> );
		} );

		return placeholders;
	}

	render() {
		return (
			<InfiniteList
				className="main main-column reader__content"
				role="main"
				items={ this.state.items }
				lastPage={ this.state.lastPage }
				fetchingNextPage={ this.state.loading }
				guessedItemHeight="200"
				fetchNextPage={ this.fetchNextPage }
				getItemRef={ this.getItemRef }
				renderItem={ this.renderPost }
				renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
			/>
		);
	}
}
```

If you need reset scroll state of `InfiniteList` component, e.g. because the using component received list with different content, assign it different `key`, so that React creates new instance for it.
