/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import ReactDom from 'react-dom';
import throttle from 'lodash/throttle';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';

class StickyPanel extends Component {
	static propTypes = {
		className: PropTypes.string,
	};

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	componentDidMount() {
		if ( viewport.isMobile() ) {
			return null;
		}

		this.throttleOnResize = throttle( this.onWindowResize, 200 );
		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );

		this.stickyDomElement = ReactDom.findDOMNode( this );

		this.updateIsSticky();
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.cancelAnimationFrame( this.rafHandle );
	}

	onWindowScroll = () => {
		this.rafHandle = window.requestAnimationFrame( this.updateIsSticky );
	};

	onWindowResize = () => {
		this.setState( {
			spacerHeight: this.state.isSticky ? ReactDom.findDOMNode( this ).clientHeight : 0,
			blockWidth: this.state.isSticky ? ReactDom.findDOMNode( this ).clientWidth : 0
		} );
	};

	updateIsSticky = () => {
		const isSticky = window.pageYOffset > this.threshold;

		if ( viewport.isMobile() ) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky: isSticky,
				spacerHeight: isSticky ? ReactDom.findDOMNode( this ).clientHeight : 0,
				blockWidth: isSticky ? ReactDom.findDOMNode( this ).clientWidth : 0,
			} );
		}
	};

	getBlockStyle() {
		if ( this.state.isSticky ) {
			// Offset to account for Master Bar by finding body visual top
			// relative the current scroll position
			const offset = document.getElementById( 'header' ).getBoundingClientRect().height;

			return {
				top: offset,
				width: this.state.blockWidth,
			};
		}
	}

	render() {
		const classes = classNames(
			'sticky-panel',
			this.props.className,
			{ 'is-sticky': this.state.isSticky }
		);

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

export default StickyPanel;

