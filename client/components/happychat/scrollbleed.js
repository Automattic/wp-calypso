/**
 * A mixin that prevents scrolling events triggered by the mousewheel from moving scrollable containers
 * not directly under the mouse.
 *
 * By default when scrolling a scrollable HTML element, once the boundary is reached the scrolling events
 * will continue up the DOM tree and ultimately end up scrolling the page.
 *
 */

export default {
	componentWillUnmount() {
		this.scrollbleedUnlock();
	},

	setScrollbleedTarget( node ) {
		this._scrollbleed_node = node;
	},

	_scrollbleed_handleScroll( e ) {
		let delta = null;
		if ( ! this._scrollbleed_node ) {
			return;
		}

		e = e || window.event;
		if ( e.preventDefault ) {
			e.preventDefault();
		}
		e.returnValue = false;

		// scroll the window itself using JS
		// this is not perfect, we're basically guessing at how much your wheel usually scrolls
		if ( e === 'DOMMouseScroll' ) {
			// old FF
			delta = e.detail * -10;
		} else if ( e.wheelDelta ) {
			// webkit
			delta = e.wheelDelta / 8;
		} else if ( e.deltaY ) {
			// new FF
			if ( e.deltaMode && e.deltaMode === 0 ) {
				// scrolling pixels
				delta = -1 * e.deltaY;
			} else if ( e.deltaMode && e.deltaMode === 1 ) {
				// scrolling lines
				delta = -1 * e.deltaY * 15;
			} else {
				// fallback
				delta = -1 * e.deltaY * 10;
			}
		}

		this._scrollbleed_node.scrollTop -= delta;
	},

	scrollbleedLock() {
		if ( window.addEventListener ) {
			// older FF
			window.addEventListener( 'DOMMouseScroll', this._scrollbleed_handleScroll, false );
		}
		window.onwheel = this._scrollbleed_handleScroll;
		window.onmousewheel = document.onmousewheel = this._scrollbleed_handleScroll;
	},

	scrollbleedUnlock() {
		if ( window.removeEventListener ) {
			// older FF
			window.removeEventListener( 'DOMMouseScroll', this._scrollbleed_handleScroll, false );
		}
		window.onwheel = null;
		window.onmousewheel = document.onmousewheel = null;
	},
};
