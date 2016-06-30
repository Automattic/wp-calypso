/**
 * External dependencies
 */
var throttle = require( 'lodash/throttle' ),
	SCROLL_CHECK_RATE_IN_MS = 400;

module.exports = function( nextPageMethod ) {

	return {

		componentDidMount: function() {
			this.checkScrollPositionHandler = throttle(
				this.checkScrollPosition.bind( this, {
					triggeredByScroll: true
				} ),
				SCROLL_CHECK_RATE_IN_MS
			);
			window.addEventListener( 'scroll', this.checkScrollPositionHandler );
			this.checkScrollPosition( {
				triggeredByScroll: false
			} );
		},

		componentDidUpdate: function() {
			this.checkScrollPosition( {
				triggeredByScroll: false
			} );
		},

		componentWillUnmount: function() {
			window.removeEventListener( 'scroll', this.checkScrollPositionHandler );
		},

		checkScrollPosition: function( options ) {
			var scrollPosition = window.pageYOffset,
				documentHeight = document.body.scrollHeight,
				viewportHeight = window.innerHeight,
				scrollOffset = 2 * viewportHeight,
				triggeredByScroll = options.triggeredByScroll,
				self = this;

			if ( scrollPosition >= ( documentHeight - viewportHeight - scrollOffset ) ) {

				// Consider all page fetches once user starts scrolling as triggered by scroll
				// Same condition check is in components/infinite-list/scroll-helper loadNextPage
				if ( scrollPosition > viewportHeight ) {
					triggeredByScroll = true;
				}

				// scroll check may be triggered while dispatching an action,
				// we cannot create new action while dispatching old one
				setTimeout( function() {
					self[ nextPageMethod ]( {
						triggeredByScroll: triggeredByScroll
					} );
				}, 0 );
			}
		}
	};
};
