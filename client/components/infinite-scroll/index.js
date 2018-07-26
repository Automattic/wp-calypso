/** @format */

/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { throttle, defer } from 'lodash';
import afterLayoutFlush from 'lib/after-layout-flush';

const SCROLL_CHECK_RATE_IN_MS = 400;

export default class InfiniteScroll extends React.Component {
	static propTypes = {
		nextPageMethod: PropTypes.func.isRequired,
	};

	observedElement = React.createRef();

	componentDidMount() {
		this.hasIntersectionObserver = 'IntersectionObserver' in window;

		if ( this.hasIntersectionObserver && this.observedElement.current ) {
			this.observer = new IntersectionObserver( this.handleIntersection, {
				rootMargin: '100%',
				threshold: 1.0,
			} );
			this.observer.observe( this.observedElement.current );
		} else {
			window.addEventListener( 'scroll', this.checkScrollPositionHandler );
			this.deferredTimer = defer( () => this.checkScrollPositionHandler( false ) );
		}
	}

	componentDidUpdate() {
		if ( ! this.hasIntersectionObserver && ! this.deferredTimer ) {
			this.deferredTimer = defer( () => this.checkScrollPositionHandler( false ) );
		}
	}

	componentWillUnmount() {
		// Clean up scroll codepath.
		window.removeEventListener( 'scroll', this.checkScrollPositionHandler );
		this.clearTimers();

		// Clean up IntersectionObserver codepath.
		if ( this.observer ) {
			this.observer.disconnect();
		}
	}

	handleIntersection = entries => {
		if ( entries && entries[ 0 ] && entries[ 0 ].isIntersecting ) {
			const { boundingClientRect, rootBounds } = entries[ 0 ];
			const triggeredByScroll = boundingClientRect.bottom >= rootBounds.bottom;
			this.props.nextPageMethod( { triggeredByScroll } );
		}
	};

	clearTimers() {
		window.clearTimeout( this.deferredTimer );
		this.deferredTimer = null;
	}

	checkScrollPositionHandler = throttle(
		afterLayoutFlush( triggeredByScroll => this.checkScrollPosition( triggeredByScroll ) ),
		SCROLL_CHECK_RATE_IN_MS
	);

	checkScrollPosition( triggeredByScroll ) {
		if ( ! this.hasIntersectionObserver ) {
			this.clearTimers();

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
		}
	}

	render() {
		return <div ref={ this.observedElement } />;
	}
}
