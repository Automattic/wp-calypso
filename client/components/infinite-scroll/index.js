/** @format */

/**
 * External dependencies
 */
import { Component } from 'react';
import PropTypes from 'prop-types';
import { throttle } from 'lodash';

const SCROLL_CHECK_RATE_IN_MS = 400;

export default class InfiniteScroll extends Component {
	static propTypes = {
		nextPageMethod: PropTypes.func.isRequired,
	};

	checkScrollPositionHandler = throttle(
		() => this.checkScrollPosition( true ),
		SCROLL_CHECK_RATE_IN_MS
	);

	componentDidMount() {
		window.addEventListener( 'scroll', this.checkScrollPositionHandler );
		this.checkScrollPosition( false );
	}

	componentDidUpdate() {
		this.checkScrollPosition( false );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.checkScrollPositionHandler );
	}

	checkScrollPosition( triggeredByScroll ) {
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

	render() {
		return null;
	}
}
