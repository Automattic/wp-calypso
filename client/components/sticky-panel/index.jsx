/**
 * External dependencies
 */
var React = require( 'react' ),
	throttle = require( 'lodash/function/throttle' ),
	raf = require( 'raf' ),
	classNames = require( 'classnames' );

/**
 * Internal dependencies
 */
var viewport = require( 'lib/viewport' );

module.exports = React.createClass( {
	displayName: 'StickyPanel',

	getInitialState: function() {
		return {
			isSticky: false,
			spacerHeight: 0,
			blockWidth: 0
		};
	},

	componentDidMount: function() {
		// Determine and cache vertical threshold from rendered element's
		// offset relative the document
		this.threshold = React.findDOMNode( this ).offsetTop;
		this.throttleOnResize = throttle( this.onWindowResize, 200 );

		window.addEventListener( 'scroll', this.onWindowScroll );
		window.addEventListener( 'resize', this.throttleOnResize );
		this.updateIsSticky();
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'scroll', this.onWindowScroll );
		window.removeEventListener( 'resize', this.throttleOnResize );
		raf.cancel( this.rafHandle );
	},

	onWindowScroll: function() {
		this.rafHandle = raf( this.updateIsSticky );
	},

	onWindowResize: function() {
		this.setState( {
			spacerHeight: this.state.isSticky ? React.findDOMNode( this ).clientHeight : 0,
			blockWidth: this.state.isSticky ? React.findDOMNode( this ).clientWidth : 0
		} );
	},

	updateIsSticky: function() {
		var isSticky = window.pageYOffset > this.threshold;

		if ( viewport.isMobile() ) {
			return this.setState( { isSticky: false } );
		}

		if ( isSticky !== this.state.isSticky ) {
			this.setState( {
				isSticky: isSticky,
				spacerHeight: isSticky ? React.findDOMNode( this ).clientHeight : 0,
				blockWidth: isSticky ? React.findDOMNode( this ).clientWidth : 0
			} );
		}
	},

	getBlockStyle: function() {
		var offset;

		if ( this.state.isSticky ) {
			// Offset to account for Master Bar by finding body visual top
			// relative the current scroll position
			offset = document.getElementById( 'primary' ).getBoundingClientRect().top;

			return {
				top: offset + window.pageYOffset,
				width: this.state.blockWidth
			};
		}
	},

	render: function() {
		var classes = classNames( 'sticky-panel', this.props.className, {
			'is-sticky': this.state.isSticky
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
} );
