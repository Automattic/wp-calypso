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

	calculateOffset() {
		// Offset to account for Master Bar by finding body visual top
		// relative the current scroll position
		return document.getElementById( 'header' ).getBoundingClientRect().height;
	}

	componentDidMount() {
		this.deferredTimer = defer( () => {
			this.updateIsSticky();
		} );
		this.throttleOnResize = throttle( this.onWindowResize, 200 );

		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		window.clearTimeout( this.deferredTimer );
		this.updateIsSticky.cancel();
	}

	onWindowScroll = () => {
		this.updateIsSticky();
	};

	onWindowResize = () => {
		this.setState( {
			spacerHeight: this.state.isSticky ? ReactDom.findDOMNode( this ).clientHeight : 0,
			blockWidth: this.state.isSticky ? ReactDom.findDOMNode( this ).clientWidth : 0,
		} );
	};

	updateIsSticky = afterLayoutFlush( () => {
		// Determine vertical threshold from rendered element's offset relative the document
		const threshold = ReactDom.findDOMNode( this ).getBoundingClientRect().top;

		const isSticky = threshold < this.calculateOffset();

		if (
			( this.props.minLimit !== false && this.props.minLimit >= window.innerWidth ) ||
			isMobile()
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
	} );

	getBlockStyle = () => {
		if ( this.state.isSticky ) {
			return {
				top: this.calculateOffset(),
				width: this.state.blockWidth,
			};
		}
	};

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
