/**
 * External dependencies
 */
import ReactDom from 'react-dom';
import React from 'react';
import debugFactory from 'debug';

/**
 * Globals
 */
const debug = debugFactory( 'calypso:resizable-iframe' ),
	noop = () => {};

export default React.createClass( {
	displayName: 'ResizableIframe',

	propTypes: {
		src: React.PropTypes.string,
		width: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.number
		] ),
		height: React.PropTypes.oneOfType( [
			React.PropTypes.string,
			React.PropTypes.number
		] ),
		onLoad: React.PropTypes.func,
		onResize: React.PropTypes.func
	},

	getInitialState: function() {
		return { width: 0, height: 0 };
	},

	getDefaultProps: function() {
		return {
			onLoad: noop,
			onResize: noop
		};
	},

	componentWillMount: function() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
	},

	componentDidMount: function() {
		window.addEventListener( 'message', this.checkMessageForResize, false );
		this.maybeConnect();
	},

	componentDidUpdate: function() {
		this.maybeConnect();
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'message', this.checkMessageForResize );
	},

	getFrameBody: function() {
		return ReactDom.findDOMNode( this.refs.iframe ).contentDocument.body;
	},

	maybeConnect: function() {
		if ( ! this.isFrameAccessible() ) {
			return;
		}

		const body = this.getFrameBody();
		if ( null !== body.getAttribute( 'data-resizable-iframe-connected' ) ) {
			return;
		}

		let script = document.createElement( 'script' );
		script.innerHTML = `
			( function() {
				var observer;

				if ( ! window.MutationObserver || ! document.body || ! window.top ) {
					return;
				}

				function sendResize() {
					window.top.postMessage( {
						action: 'resize',
						width: document.body.offsetWidth,
						height: document.body.offsetHeight
					}, '*' );
				}

				observer = new MutationObserver( sendResize );
				observer.observe( document.body, {
					attributes: true,
					attributeOldValue: false,
					characterData: true,
					characterDataOldValue: false,
					childList: true,
					subtree: true
				} );

				document.body.style.position = 'absolute';
				document.body.setAttribute( 'data-resizable-iframe-connected', '' );

				sendResize();
			} )();
		`;
		body.appendChild( script );
	},

	isFrameAccessible: function() {
		try {
			return !! this.getFrameBody();
		} catch ( e ) {
			return false;
		}
	},

	checkMessageForResize: function( event ) {
		const iframe = ReactDom.findDOMNode( this.refs.iframe );

		// Attempt to parse the message data as JSON if passed as string
		let data = event.data || {};
		if ( 'string' === typeof data ) {
			try {
				data = JSON.parse( data );
			} catch ( e ) {} // eslint-disable-line no-empty
		}

		// Verify that the mounted element is the source of the message
		if ( ! iframe || iframe.contentWindow !== event.source ) {
			return;
		}

		debug( 'Received message: %o', data );

		// Update the state only if the message is formatted as we expect, i.e.
		// as an object with a 'resize' action, width, and height
		const { action, width, height } = data;
		const { width: oldWidth, height: oldHeight } = this.state;

		if ( 'resize' === action && ( oldWidth !== width || oldHeight !== height ) ) {
			this.setState( { width, height } );
			this.props.onResize();
		}
	},

	onLoad: function( event ) {
		this.maybeConnect();
		this.props.onLoad( event );
	},

	render: function() {
		return (
			<iframe
				ref="iframe"
				{ ...this.props }
				onLoad={ this.onLoad }
				width={ this.props.width || this.state.width }
				height={ this.props.height || this.state.height } />
		);
	}
} );
