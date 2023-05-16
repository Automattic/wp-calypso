import { isMobile } from '@automattic/viewport';
import classNames from 'classnames';
import { throttle, debounce, defer } from 'lodash';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactDom from 'react-dom';
import afterLayoutFlush from 'calypso/lib/after-layout-flush';

import './style.scss';

const RESIZE_RATE_IN_MS = 200;

const hasIntersectionObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;

const commonPropTypes = {
	minLimit: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.number ] ),
};

const commonDefaultProps = {
	minLimit: false,
};

export function calculateOffset() {
	const headerEl = document.getElementById( 'header' );
	// Offset to account for Masterbar if it is fixed position
	if ( headerEl && getComputedStyle( headerEl ).position === 'fixed' ) {
		return headerEl.getBoundingClientRect().height;
	}
	return 0;
}

export function getBlockStyle( state ) {
	if ( state.isSticky ) {
		return {
			top: calculateOffset(),
			width: state.blockWidth,
		};
	}
}

export function getDimensions( node, isSticky ) {
	return {
		spacerHeight: isSticky ? ReactDom.findDOMNode( node ).clientHeight : 0,
		blockWidth: isSticky ? ReactDom.findDOMNode( node ).clientWidth : 0,
	};
}

export function getDimensionUpdates( node, previous ) {
	const newDimensions = getDimensions( node, previous.isSticky );
	return previous.spacerHeight !== newDimensions.spacerHeight ||
		previous.blockWidth !== newDimensions.blockWidth
		? newDimensions
		: null;
}

function renderStickyPanel( props, state ) {
	const classes = classNames( 'sticky-panel', props.className, {
		'is-sticky': state.isSticky,
	} );

	return (
		<div className={ classes }>
			<div className="sticky-panel__content" style={ getBlockStyle( state ) }>
				{ props.children }
			</div>
			<div
				className="sticky-panel__spacer"
				style={ { height: state.spacerHeight, width: state.blockWidth } }
			/>
		</div>
	);
}

function isWindowTooSmall( minLimit ) {
	// if minLimit is 0, we don't want to check for window size
	if ( minLimit === 0 ) {
		return false;
	}
	return ( minLimit !== false && minLimit >= window.innerWidth ) || isMobile();
}

class StickyPanelWithIntersectionObserver extends Component {
	static displayName = 'StickyPanel';

	static propTypes = commonPropTypes;
	static defaultProps = commonDefaultProps;

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	onIntersection = afterLayoutFlush( ( entries ) => {
		if ( ! entries || ! entries[ 0 ] ) {
			return;
		}
		const { intersectionRatio, rootBounds, boundingClientRect } = entries[ 0 ];
		const isSticky = intersectionRatio < 1 && rootBounds.bottom > boundingClientRect.bottom;
		this.updateStickyState( isSticky );
	} );

	throttleOnResize = throttle(
		() => this.setState( ( prevState ) => getDimensions( this, prevState.isSticky ) ),
		RESIZE_RATE_IN_MS
	);

	// backup in case the user scrolls past the panel too quickly
	// debounce triggers after the scroll event has finished firing
	// see https://github.com/Automattic/wp-calypso/issues/76743
	throttleOnScroll = debounce(
		afterLayoutFlush( () => {
			// Determine vertical threshold from rendered element's offset relative the document
			const threshold = ReactDom.findDOMNode( this ).getBoundingClientRect().top;
			const isSticky = threshold < calculateOffset();
			this.updateStickyState( isSticky );
		} ),
		50
	);

	componentDidMount() {
		window.addEventListener( 'resize', this.throttleOnResize );
		window.addEventListener( 'scroll', this.throttleOnScroll );

		this.deferredMount = defer( () => {
			this.observer = new IntersectionObserver( this.onIntersection, {
				threshold: [ 0, 1 ],
				rootMargin: `-${ calculateOffset() }px 0px 0px 0px`,
			} );
			this.observer.observe( ReactDom.findDOMNode( this ) );
		} );
	}

	componentWillUnmount() {
		if ( this.observer ) {
			this.observer.disconnect();
		}
		this.onIntersection.cancel();
		clearTimeout( this.deferredMount );
		window.removeEventListener( 'resize', this.throttleOnResize );
	}

	updateStickyState( isSticky ) {
		if ( isWindowTooSmall( this.props.minLimit ) ) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky,
				...getDimensions( this, isSticky ),
			} );
		}
	}

	render() {
		return renderStickyPanel( this.props, this.state );
	}
}

class StickyPanelWithScrollEvent extends Component {
	static displayName = 'StickyPanel';

	static propTypes = commonPropTypes;
	static defaultProps = commonDefaultProps;

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	onWindowScroll = afterLayoutFlush( () => {
		// Determine vertical threshold from rendered element's offset relative the document
		const threshold = ReactDom.findDOMNode( this ).getBoundingClientRect().top;
		const isSticky = threshold < calculateOffset();
		this.updateStickyState( isSticky );
	} );

	throttleOnResize = throttle(
		() => this.setState( ( prevState ) => getDimensionUpdates( this, prevState ) ),
		RESIZE_RATE_IN_MS
	);

	componentDidMount() {
		this.onWindowScroll();

		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		this.onWindowScroll.cancel();
	}

	updateStickyState( isSticky ) {
		if ( isWindowTooSmall( this.props.minLimit ) ) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky,
				...getDimensions( this, isSticky ),
			} );
		}
	}

	render() {
		return renderStickyPanel( this.props, this.state );
	}
}

export default hasIntersectionObserver
	? StickyPanelWithIntersectionObserver
	: StickyPanelWithScrollEvent;
