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

		this.scrollLock();
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.checkScrollable );
		React.findDOMNode( this.refs[ 'scrollable-content' ] ).removeEventListener( 'scroll', this.checkScrolledToBottom );

		this.scrollRelease();
	},

	componentDidUpdate: function() {
		this.checkScrollable();
		this.checkScrolledToBottom();
		this.scrollLock();
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

    scrollLock: function () {
		var content = React.findDOMNode( this.refs[ 'scrollable-content' ] );
		if ( content ) {
			content.addEventListener( 'wheel', this.onScrollHandler );
		}
    },

	scrollRelease: function () {
		var content = React.findDOMNode( this.refs[ 'scrollable-content' ] );
		if ( content ) {
			content.removeEventListener( 'wheel', this.onScrollHandler );
		}
	},

    cancelScrollEvent: function ( event ) {
		event.stopImmediatePropagation();
		event.preventDefault();
		event.returnValue = false;
		return false;
    },

    onScrollHandler: function ( event ) {
		var content = React.findDOMNode( this.refs[ 'scrollable-content' ] );
		var scrollTop = content.scrollTop;
		var scrollHeight = content.scrollHeight;
		var height = content.clientHeight;
		var wheelDelta = event.deltaY;
		var isDeltaPositive = wheelDelta > 0;

		if ( isDeltaPositive && wheelDelta > scrollHeight - height - scrollTop ) {
			content.scrollTop = scrollHeight;
			return this.cancelScrollEvent( event );
		}
		else if ( ! isDeltaPositive && -wheelDelta > scrollTop ) {
			content.scrollTop = 0;
			return this.cancelScrollEvent( event );
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
