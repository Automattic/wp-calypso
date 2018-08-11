/** @format */

/**
 * External dependencies
 */

import { throttle, defer } from 'lodash';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';
import afterLayoutFlush from 'lib/after-layout-flush';

/**
 * Internal dependencies
 */
import { isMobile } from 'lib/viewport';

/**
 * Style dependencies
 */
import './style.scss';

const RESIZE_RATE_IN_MS = 200;

const hasIntersectionObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window;

class StickyPanelBase extends React.Component {
	static displayName = 'StickyPanel';

	static propTypes = {
		minLimit: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.number ] ),
	};

	static defaultProps = {
		minLimit: false,
	};

	calculateOffset() {
		// Offset to account for Master Bar
		return document.getElementById( 'header' ).getBoundingClientRect().height;
	}

	getBlockStyle() {
		if ( this.state.isSticky ) {
			return {
				top: this.calculateOffset(),
				width: this.state.blockWidth,
			};
		}
	}

	getDimensions( isSticky ) {
		return {
			spacerHeight: isSticky ? ReactDom.findDOMNode( this ).clientHeight : 0,
			blockWidth: isSticky ? ReactDom.findDOMNode( this ).clientWidth : 0,
		};
	}

	onWindowResize() {
		this.setState( prevState => this.getDimensions( prevState.isSticky ) );
	}

	updateStickyState( isSticky ) {
		if (
			( this.props.minLimit !== false && this.props.minLimit >= window.innerWidth ) ||
			isMobile()
		) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky,
				...this.getDimensions( isSticky ),
			} );
		}
	}

	render() {
		const classes = classNames( 'sticky-panel', this.props.className, {
			'is-sticky': this.state.isSticky,
		} );

		return (
			<div className={ classes }>
				<div className="sticky-panel__content" style={ this.getBlockStyle() }>
					{ this.props.children }
				</div>
				<div className="sticky-panel__spacer" style={ { height: this.state.spacerHeight } } />
			</div>
		);
	}
}

class StickyPanelWithIntersectionObserver extends StickyPanelBase {
	throttleOnResize = throttle( this.onWindowResize.bind( this ), RESIZE_RATE_IN_MS );

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	onIntersection = afterLayoutFlush( entries => {
		if ( ! entries || ! entries[ 0 ] ) {
			return;
		}
		const { intersectionRatio, rootBounds, boundingClientRect } = entries[ 0 ];
		const isSticky = intersectionRatio < 1 && rootBounds.bottom > boundingClientRect.bottom;
		this.updateStickyState( isSticky );
	} );

	componentDidMount() {
		window.addEventListener( 'resize', this.throttleOnResize );

		this.deferredMount = defer( () => {
			this.observer = new IntersectionObserver( this.onIntersection, {
				threshold: [ 0, 1 ],
				rootMargin: `-${ this.calculateOffset() }px 0px 0px 0px`,
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
}

class StickyPanelWithScrollEvent extends StickyPanelBase {
	throttleOnResize = throttle( this.onWindowResize.bind( this ), RESIZE_RATE_IN_MS );

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	componentDidMount() {
		this.deferredTimer = defer( () => {
			this.onWindowScroll();
		} );

		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.clearTimeout( this.deferredTimer );
		this.handleScroll.cancel();
	}

	onWindowScroll = afterLayoutFlush( () => {
		// Determine vertical threshold from rendered element's offset relative the document
		const threshold = ReactDom.findDOMNode( this ).getBoundingClientRect().top;
		const isSticky = threshold < this.calculateOffset();
		this.updateStickyState( isSticky );
	} );
}

export default ( hasIntersectionObserver
	? StickyPanelWithIntersectionObserver
	: StickyPanelWithScrollEvent );
