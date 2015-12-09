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
			isScrolledToBottom: false
		}
	},

	componentDidMount: function() {
		window.addEventListener( 'resize', this.checkScrollable );
		this.checkScrollable();

		React.findDOMNode( this.refs[ 'scrollable-content' ] ).addEventListener( 'scroll', this.checkScrolledToBottom );
		this.checkScrolledToBottom();
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.checkScrollable );
		React.findDOMNode( this.refs[ 'scrollable-content' ] ).removeEventListener( 'scroll', this.checkScrolledToBottom );
	},

	componentDidUpdate: function() {
		this.checkScrollable();
		this.checkScrolledToBottom();
	},

	/**
	 * Check to see if the div is scrollable, that is, if the
	 * div is taller than the window's height.
	 */
	checkScrollable: function() {
		var windowHeight = window.innerHeight,
			content = React.findDOMNode( this.refs[ 'scrollable-content' ] ),
			contentHeight = content.scrollHeight;

		if ( contentHeight > ( windowHeight ) ) {
			this.smartSetState( { isScrollable: true } );
		} else {
			this.smartSetState( { isScrollable: false } );
		}
	},

	/**
	 * Check to see if the div is scrolled to it's bottom.
	 * This is used to hide/show the chevron Gridicon as needed.
	 */
	checkScrolledToBottom: function() {
		var content = React.findDOMNode( this.refs[ 'scrollable-content' ] ),
			isAtBottom = ( content.scrollTop === ( content.scrollHeight - content.offsetHeight ) );

		if ( isAtBottom ) {
			this.smartSetState( { isScrolledToBottom: true } );
		} else {
			this.smartSetState( { isScrolledToBottom: false } );
		}
	},

	render() {
		let containerClasses,
			child = React.cloneElement( React.Children.only( this.props.children ), { ref: 'scrollable-content' } );

		containerClasses = classnames( {
			'is-scrollable': this.state.isScrollable,
			'is-scrolled-to-bottom': this.state.isScrolledToBottom
		}, this.props.className, 'scrollable-container' );

		return (
			<div className={ containerClasses }>
				{ child }

				<div className="scroll-indicator"><Gridicon icon="chevron-down" /></div>
			</div>
		);
	}
} );
