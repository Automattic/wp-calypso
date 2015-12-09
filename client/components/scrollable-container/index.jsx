/**
 * External dependencies
 */
import React from 'react/addons';
import classnames from 'classnames';
import smartSetState from 'lib/react-smart-set-state';

/**
 * Internal dependencies
 */
 import Gridicon from 'components/gridicon';

 export default React.createClass( {
	displayName: 'ScrollableContainer',
	smartSetState: smartSetState,

	getInitialState: function() {
		return {
			isScrollable: false,
			isScrolled: false
		}
	},

	componentDidMount: function() {
		window.addEventListener( 'resize', this.checkScrollable );
		this.checkScrollable();

		document.getElementById( 'wp-sidebar' ).addEventListener( 'scroll', this.checkScrolled );
		this.checkScrolled();
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.checkScrollable );
		document.getElementById( 'wp-sidebar' ).removeEventListener( 'scroll', this.checkScrolled );
	},

	componentDidUpdate: function() {
		this.checkScrollable();
		this.checkScrolled();
	},

	/**
	 * Check to see if the div is scrollable, that is, if the
	 * div is taller than the window's height.
	 */
	checkScrollable: function() {
		var windowHeight = window.innerHeight,
			sidebar = document.getElementById( 'wp-sidebar' ),
			sidebarHeight = sidebar.scrollHeight;

		if ( sidebarHeight > ( windowHeight ) ) {
			this.smartSetState( { isScrollable: true } );
		} else {
			this.smartSetState( { isScrollable: false } );
		}
	},

	/**
	 * Check to see if the div is scrolled to it's bottom.
	 * This is used to hide/show the chevron Gridicon as needed.
	 */
	checkScrolled: function() {
		var sidebar = document.getElementById( 'wp-sidebar' ),
			isAtBottom = ( sidebar.scrollTop === ( sidebar.scrollHeight - sidebar.offsetHeight ) );

		if ( isAtBottom ) {
			this.smartSetState( { isScrolled: true } );
		} else {
			this.smartSetState( { isScrolled: false } );
		}
	},

	render() {
		let containerClasses;

		containerClasses = classnames( {
			'is-scrollable': this.state.isScrollable,
			'is-scrolled': this.state.isScrolled
		}, this.props.className, 'scrollable-container' );

		return (
			<div className={ containerClasses }>
				{ this.props.children }

				<div className="scroll-indicator"><Gridicon icon="chevron-down" /></div>
			</div>
		);
	}
} );
