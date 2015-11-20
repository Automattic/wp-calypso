Infinite Scroll
===============

An infinite scroll React mixin to power list views. Currently a simple dependency-less implementation, which only requires lodash's `throttle` function.

There is an alternative implementaion called [InfiniteList](../../../components/infinite-list/), which doesn't render invisible items. However, it is more complex to implement, so use it only if your list contains lot of images or other media and you expect that users will scroll a lot.

### How to use

First, require the component with `var infiniteScroll = require( 'lib/mixins/infinite-scroll' )` and in your `React.createClass` add it as a mixin, passing a name of method that fetches next page.

If there are conditions when next page should not be loaded (e.g. next page is already loading, or last page was reached, it must be checked in that method.

This mixin does not add any analytics tracking - that is also responsibility of `fetchNextPage` method.

The method accepts an object as an argument, with one key `triggeredByScroll`. It signals if fetching page is a response to user action, or the mixin trying to automatically fill available space. This is to prevent tracking analytics event for cases where more than one page fits to screen.

### Example implementation


```js
mixins: [ infiniteScroll( 'fetchNextPage' ) ],

fetchNextPage: function( options ) {
	if ( this.state.loading || this.state.lastPage ) {
		return;
	}
	if ( options.triggeredByScroll ) {
		// track analytics event
	}

	actions.fetchNextPage();
}

```


([Read more about React mixins](http://facebook.github.io/react/docs/reusable-components.html#mixins).)
