/** @format */

/**
 * External dependencies
 */

import { throttle } from 'lodash';
import PropTypes from 'prop-types';
import ReactDom from 'react-dom';
import React from 'react';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import viewport from 'lib/viewport';

export default class extends React.Component {
	static displayName = 'StickyPanel';

	static propTypes = {
		minLimit: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.number ] ),
	};

	static defaultProps = {
		minLimit: false,
	};

	state = {
		isSticky: false,
		spacerHeight: 0,
		blockWidth: 0,
	};

	componentDidMount() {
		// Determine and cache vertical threshold from rendered element's
		// offset relative the document
		this.threshold = ReactDom.findDOMNode( this ).offsetTop;
		this.throttleOnResize = throttle( this.onWindowResize, 200 );

		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
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
			blockWidth: this.state.isSticky ? ReactDom.findDOMNode( this ).clientWidth : 0,
		} );
	};

	updateIsSticky = () => {
		var isSticky = window.pageYOffset > this.threshold;

		if (
			( this.props.minLimit !== false && this.props.minLimit >= window.innerWidth ) ||
			viewport.isMobile()
		) {
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

	getBlockStyle = () => {
		var offset;

		if ( this.state.isSticky ) {
			// Offset to account for Master Bar by finding body visual top
			// relative the current scroll position
			offset = document.getElementById( 'header' ).getBoundingClientRect().height;

			return {
				top: offset,
				width: this.state.blockWidth,
			};
		}
	};

	render() {
		var classes = classNames( 'sticky-panel', this.props.className, {
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
