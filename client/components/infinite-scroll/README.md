# Infinite Scroll

An infinite scroll component to power list views.

There is an alternative implementation called [InfiniteList](../infinite-list), which doesn't render invisible items. However, it is more complex to implement, so use it only if your list contains lot of images or other media and you expect that users will scroll a lot.

## How to use

First, require the component with

```js
import InfiniteScroll from 'calypso/components/infinite-scroll';
```

and in your component's `render` method, render it, passing a name of method that fetches next page. Be sure to place it at the bottom of your content list, so that it can serve as an anchor point for a new load.

If there are conditions when next page should not be loaded (e.g. next page is already loading, or last page was reached, it must be checked in that method.

This component does not add any analytics tracking - that is also responsibility of `fetchNextPage` method.

The method accepts an object as an argument, with one key `triggeredByScroll`. It signals if fetching page is a response to user action, or if the component is trying to automatically fill available space. This is to prevent tracking analytics event for cases where more than one page fits to screen.

## Example implementation

```jsx
class List extends Component {
	fetchNextPage = ( options ) => {
		if ( this.state.loading || this.state.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			// track analytics event
		}

		this.props.fetchNextPage();
	};

	render() {
		return (
			<div>
				{ this.props.items.map( this.renderItem ) }
				<InfiniteScroll fetchNextPage={ this.fetchNextPage } />
			</div>
		);
	}
}
```
