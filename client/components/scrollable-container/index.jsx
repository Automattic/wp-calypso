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

		React.findDOMNode( this.refs[ 'sidebar-container' ] ).addEventListener( 'scroll', this.checkScrolled );
		this.checkScrolled();

		console.log( 'componentDidMount' );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.checkScrollable );
		React.findDOMNode( this.refs[ 'sidebar-container' ] ).removeEventListener( 'scroll', this.checkScrolled );
	},

	componentDidUpdate: function() {
		this.checkScrollable();
		this.checkScrolled();

		console.log( 'componentDidUpdate' );
	},

	/**
	 * Check to see if the div is scrollable, that is, if the
	 * div is taller than the window's height.
	 */
	checkScrollable: function() {
		var windowHeight = window.innerHeight,
			sidebar = React.findDOMNode( this.refs[ 'sidebar-container' ] ),
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
		var sidebar = React.findDOMNode( this.refs[ 'sidebar-container' ] ),
			isAtBottom = ( sidebar.scrollTop === ( sidebar.scrollHeight - sidebar.offsetHeight ) );

		if ( isAtBottom ) {
			this.smartSetState( { isScrolled: true } );
		} else {
			this.smartSetState( { isScrolled: false } );
		}
	},

	render() {
		let containerClasses,
			child = React.cloneElement( React.Children.only( this.props.children ), { ref: 'sidebar-container' } );

		containerClasses = classnames( {
			'is-scrollable': this.state.isScrollable,
			'is-scrolled': this.state.isScrolled
		}, this.props.className, 'scrollable-container' );

		return (
			<div className={ containerClasses }>
				{ child }

				<div className="scroll-indicator"><Gridicon icon="chevron-down" /></div>
			</div>
		);
	}
} );
