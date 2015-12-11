/**
 * External dependencies
 */
var clickOutside = require( 'click-outside' ),
	ReactDom = require( 'react-dom' ),
	React = require( 'react' ),
	omit = require( 'lodash/object/omit' ),
	Tip = require( 'component-tip' );

/**
 * Internal dependencies
 */
var closeOnEsc = require( 'lib/mixins/close-on-esc' ),
	warn = require( 'lib/warn' );

var Content = React.createClass( {
	mixins: [ closeOnEsc( '_close' ) ],

	render: function() {
		return (
			<div { ...this.props } tabIndex="-1" />
		);
	},

	_close: function() {
		this.props.onClose();
	}
} );

var Popover = React.createClass( {
	propTypes: {
		isVisible: React.PropTypes.bool.isRequired,
		onClose: React.PropTypes.func.isRequired,
		position: React.PropTypes.string,
		ignoreContext: React.PropTypes.shape( { getDOMNode: React.PropTypes.function } ),
	},

	getDefaultProps: function() {
		return {
			position: 'top',
			className: 'popover'
		};
	},

	componentDidMount: function() {
		this._showOrHideTip( {} );
	},

	componentDidUpdate: function( prevProps ) {
		this._showOrHideTip( prevProps );
	},

	componentWillUnmount: function() {
		clearTimeout( this._clickOutsideTimeout );
		if ( this._unbindClickOutside ) {
			this._unbindClickOutside();
			this._unbindClickOutside = null;
		}
		this._tip.remove();
		ReactDom.unmountComponentAtNode( this._container );
		this._container = null;
	},

	render: function() {
		return null;
	},

	_showOrHideTip: function( prevProps ) {
		if ( ! this._tip ) {
			this._tip = new Tip( '' );
			this._tip.classname = this.props.className;
			this._container = this._tip.inner;
		}

		if ( this.props.isVisible && this.props.context ) {
			ReactDom.render(
				<Content { ...omit( this.props, 'className' ) } onClose={ this._close } />,
				this._container
			);

			if ( ! prevProps.isVisible ) {
				const contextNode = ReactDom.findDOMNode( this.props.context );
				if ( contextNode.nodeType !== Node.ELEMENT_NODE || contextNode.nodeName.toLowerCase() === 'svg' ) {
					warn(
						'Popover is attached to a %s element (nodeType %d).  '
						+ 'This causes problems in IE11 - see 12168-gh-calypso-pre-oss.',
						contextNode.nodeName,
						contextNode.nodeType
					);
				}

				this._tip.position( this.props.position, { auto: false } );
				this._tip.show( contextNode );

				if ( this.props.onShow ) {
					this.props.onShow();
				}

				this._setupClickOutside();
			}
		} else {
			ReactDom.unmountComponentAtNode( this._container );
			this._tip.hide();

			if ( this._unbindClickOutside ) {
				this._unbindClickOutside();
				this._unbindClickOutside = null;
			}
		}
	},

	_setupClickOutside: function() {
		if ( this._unbindClickOutside ) {
			this._unbindClickOutside();
		}

		// have to setup clickOutside after a short delay, otherwise it counts the current
		// click to show the tip and the tip will never be shown
		this._clickOutsideTimeout = setTimeout( function() {
			this._unbindClickOutside = clickOutside( this._container, function( event ) {
				const contextNode = ReactDom.findDOMNode( this.props.context );
				let shouldClose = ( contextNode && contextNode.contains && ! contextNode.contains( event.target ) );

				if ( this.props.ignoreContext && shouldClose ) {
					const ignoreContext = ReactDom.findDOMNode( this.props.ignoreContext );
					shouldClose = shouldClose && ( ignoreContext && ignoreContext.contains && ! ignoreContext.contains( event.target ) );
				}

				if ( shouldClose ) {
					this._close( event );
				}
			}.bind( this ) );
		}.bind( this ), 10 );
	},

	_close: function( event ) {
		this.props.onClose( event );
	}
} );

module.exports = Popover;
