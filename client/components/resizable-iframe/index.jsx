/**
 * External dependencies
 */

import ReactDom from 'react-dom';
import PropTypes from 'prop-types';
import React from 'react';
import debugFactory from 'debug';
import { omit } from 'lodash';

/**
 * Globals
 */
const debug = debugFactory( 'calypso:resizable-iframe' ),
	noop = () => {};

export default class extends React.Component {
	static displayName = 'ResizableIframe';

	static propTypes = {
		src: PropTypes.string,
		width: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		height: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] ),
		onLoad: PropTypes.func,
		onResize: PropTypes.func,
	};

	static defaultProps = {
		onLoad: noop,
		onResize: noop,
	};

	state = { width: 0, height: 0 };

	UNSAFE_componentWillMount() {
		debug( 'Mounting ' + this.constructor.displayName + ' React component.' );
	}

	componentDidMount() {
		window.addEventListener( 'message', this.checkMessageForResize, false );
		this.maybeConnect();
	}

	componentDidUpdate() {
		this.maybeConnect();
	}

	componentWillUnmount() {
		window.removeEventListener( 'message', this.checkMessageForResize );
	}

	getFrameBody = () => {
		return ReactDom.findDOMNode( this.refs.iframe ).contentDocument.body;
	};

	maybeConnect = () => {
		if ( ! this.isFrameAccessible() ) {
			return;
		}

		const body = this.getFrameBody();
		if ( null !== body.getAttribute( 'data-resizable-iframe-connected' ) ) {
			return;
		}

		const script = document.createElement( 'script' );
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

				window.addEventListener( 'load', sendResize, true );

				// Hack: Remove viewport unit styles, as these are relative
				// the iframe root and interfere with our mechanism for
				// determining the unconstrained page bounds.
				function removeViewportStyles( ruleOrNode ) {
					[ 'width', 'height', 'minHeight', 'maxHeight' ].forEach( function( style ) {
						if ( /^\\d+(vmin|vmax|vh|vw)$/.test( ruleOrNode.style[ style ] ) ) {
							ruleOrNode.style[ style ] = '';
						}
					} );
				}

				Array.prototype.forEach.call( document.querySelectorAll( '[style]' ), removeViewportStyles );
				Array.prototype.forEach.call( document.styleSheets, function( stylesheet ) {
					Array.prototype.forEach.call( stylesheet.cssRules || stylesheet.rules, removeViewportStyles );
				} );

				document.body.style.position = 'absolute';
				document.body.setAttribute( 'data-resizable-iframe-connected', '' );

				sendResize();
			} )();
		`;
		body.appendChild( script );
	};

	isFrameAccessible = () => {
		try {
			return !! this.getFrameBody();
		} catch ( e ) {
			return false;
		}
	};

	checkMessageForResize = ( event ) => {
		const iframe = ReactDom.findDOMNode( this.refs.iframe );

		// Attempt to parse the message data as JSON if passed as string
		let data = event.data || {};
		if ( typeof data === 'string' ) {
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
	};

	onLoad = ( event ) => {
		this.maybeConnect();
		this.props.onLoad( event );
	};

	render() {
		const omitProps = [ 'onResize' ];
		return (
			<iframe
				ref="iframe"
				{ ...omit( this.props, omitProps ) }
				onLoad={ this.onLoad }
				width={ this.props.width || this.state.width }
				height={ this.props.height || this.state.height }
			/>
		);
	}
}
