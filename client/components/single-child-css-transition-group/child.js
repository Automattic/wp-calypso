var ReactDom = require( 'react-dom' );
var React = require( 'react' );

var CSSCore = require( 'fbjs/lib/CSSCore' );
var ReactTransitionEvents = require( 'react/lib/ReactTransitionEvents' );

var onlyChild = require( 'react/lib/onlyChild' );

// We don't remove the element from the DOM until we receive an animationend or
// transitionend event. If the user screws up and forgets to add an animation
// their node will be stuck in the DOM forever, so we detect if an animation
// does not start and if it doesn't, we just call the end listener immediately.
var TICK = 17;
var NO_EVENT_TIMEOUT = 2000;

var SingleChildCSSTransitionGroupChild = React.createClass( {

	transition: function( animationType, finishCallback ) {
		var node = ReactDom.findDOMNode( this );
		var className = this.props.name + '-' + animationType;
		var activeClassName = className + '-active';
		var noEventTimeout = null;

		var cleanup, endListener = function( e ) {
			if ( e && e.target !== node ) {
				return;
			}
			cleanup();
		};

		cleanup = function() {
			if ( noEventTimeout ) {
				clearTimeout( noEventTimeout );
				noEventTimeout = null;
			}

			CSSCore.removeClass( node, className );
			CSSCore.removeClass( node, activeClassName );

			ReactTransitionEvents.removeEndEventListener( node, endListener );

			// Usually this optional callback is used for informing an owner of
			// a leave animation and telling it to remove the child.
			finishCallback && finishCallback();
		};

		if ( this.props.enterTimeout && 'enter' === animationType ) {
			setTimeout( cleanup, this.props.enterTimeout );
		} else if ( this.props.leaveTimeout && 'leave' === animationType ) {
			setTimeout( cleanup, this.props.leaveTimeout );
		} else {
			ReactTransitionEvents.addEndEventListener( node, endListener );
			noEventTimeout = setTimeout( cleanup, NO_EVENT_TIMEOUT );
		}

		CSSCore.addClass( node, className );

		// Need to do this to actually trigger a transition.
		this.queueClass( activeClassName );
	},

	queueClass: function( className ) {
		this.classNameQueue.push( className );

		if ( ! this.timeout ) {
			this.timeout = setTimeout( this.flushClassNameQueue, TICK );
		}
	},

	flushClassNameQueue: function() {
		if ( this.isMounted() ) {
			this.classNameQueue.forEach(
				CSSCore.addClass.bind( CSSCore, ReactDom.findDOMNode( this ) )
			);
		}
		this.classNameQueue.length = 0;
		this.timeout = null;
	},

	componentWillMount: function() {
		this.classNameQueue = [];
	},

	componentWillUnmount: function() {
		if ( this.timeout ) {
			clearTimeout( this.timeout );
		}
	},

	componentWillEnter: function( done ) {
		if ( this.props.enter ) {
			this.transition( 'enter', done );
		} else {
			done();
		}
	},

	componentWillLeave: function( done ) {
		if ( this.props.leave ) {
			this.transition( 'leave', done );
		} else {
			done();
		}
	},

	componentDidLeave: function() {
		if ( this.props.onComponentDidLeave ) {
			this.props.onComponentDidLeave();
		}
	},

	render: function() {
		return onlyChild( this.props.children );
	}
} );

module.exports = SingleChildCSSTransitionGroupChild;
