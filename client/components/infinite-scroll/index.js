/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { throttle, defer } from 'lodash';
import afterLayoutFlush from 'lib/after-layout-flush';

const SCROLL_CHECK_RATE_IN_MS = 400;

const hasIntersectionObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;

const propTypeDefinition = {
	nextPageMethod: PropTypes.func.isRequired,
};

class InfiniteScrollWithIntersectionObserver extends React.Component {
	static propTypes = propTypeDefinition;
	static displayName = 'InfiniteScroll';

	observedElement = React.createRef();

	hasScrolledPastBottom = false;

	componentDidMount() {
		if ( this.observedElement.current ) {
			this.observer = new IntersectionObserver( this.handleIntersection, {
				rootMargin: '100%',
				threshold: 1.0,
			} );
			this.observer.observe( this.observedElement.current );
		}
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
		clearTimeout( this.deferredPageFetch );
	}

	getNextPage() {
		this.props.nextPageMethod( { triggeredByScroll: this.hasScrolledPastBottom } );
	}

	componentDidUpdate() {
		if ( ! this.deferredPageFetch && ! this.hasScrolledPastBottom ) {
			// We still need more pages, so schedule a page fetch.
			this.deferredPageFetch = defer( () => {
				if ( ! this.hasScrolledPastBottom ) {
					this.getNextPage();
				}
				this.deferredPageFetch = null;
			} );
		}
	}

	handleIntersection = ( entries ) => {
		if ( ! entries || ! entries[ 0 ] ) {
			return;
		}

		if ( entries[ 0 ].isIntersecting ) {
			this.getNextPage();
		} else {
			// The observed element is no longer in view, so future changes must
			// be caused by scrolling.
			this.hasScrolledPastBottom = true;
		}
	};

	render() {
		return <div ref={ this.observedElement } />;
	}
}

class InfiniteScrollWithScrollEvent extends React.Component {
	static propTypes = propTypeDefinition;
	static displayName = 'InfiniteScroll';

	componentDidMount() {
		window.addEventListener( 'scroll', this.checkScrollPositionHandler );
		this.throttledCheckScrollPosition( false );
	}

	componentDidUpdate() {
		this.throttledCheckScrollPosition( false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.checkScrollPositionHandler );
		this.throttledCheckScrollPosition.cancel();
		this.pendingLayoutFlush.cancel();
	}

	checkScrollPosition = ( triggeredByScroll ) => {
		const scrollPosition = window.pageYOffset;
		const documentHeight = document.body.scrollHeight;
		const viewportHeight = window.innerHeight;
		const scrollOffset = 2 * viewportHeight;

		if ( scrollPosition >= documentHeight - viewportHeight - scrollOffset ) {
			// Consider all page fetches once user starts scrolling as triggered by scroll
			// Same condition check is in components/infinite-list/scroll-helper loadNextPage
			if ( scrollPosition > viewportHeight ) {
				triggeredByScroll = true;
			}

			this.props.nextPageMethod( { triggeredByScroll } );
		}
	};

	pendingLayoutFlush = afterLayoutFlush( this.checkScrollPosition );
	throttledCheckScrollPosition = throttle( this.pendingLayoutFlush, SCROLL_CHECK_RATE_IN_MS );
	checkScrollPositionHandler = () => this.throttledCheckScrollPosition( true );

	render() {
		// Should match render output for the IntersectionObserver version,
		// since server-side rendering will always use this version.
		return <div />;
	}
}

export default hasIntersectionObserver
	? InfiniteScrollWithIntersectionObserver
	: InfiniteScrollWithScrollEvent;
