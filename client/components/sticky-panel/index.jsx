/**
 * External dependencies
 */
import { isMobile } from '@automattic/viewport';
import { throttle, defer } from 'lodash';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import afterLayoutFlush from 'lib/after-layout-flush';

/**
 * Style dependencies
 */
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
	// Offset to account for Master Bar
	return document.getElementById( 'header' ).getBoundingClientRect().height;
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
			<div className="sticky-panel__spacer" style={ { height: state.spacerHeight } } />
		</div>
	);
}

function isWindowTooSmall( minLimit ) {
	return ( minLimit !== false && minLimit >= window.innerWidth ) || isMobile();
}

class StickyPanelWithIntersectionObserver extends React.Component {
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

	componentDidMount() {
		window.addEventListener( 'resize', this.throttleOnResize );

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

class StickyPanelWithScrollEvent extends React.Component {
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
