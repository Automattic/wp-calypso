/**
 * WordPress dependencies
 */
import { Component, renderToString, createRef } from '@wordpress/element';

/**
 * Internal dependencies
 */
import FocusableIframe from '../focusable-iframe';
import withGlobalEvents from '../higher-order/with-global-events';

class Sandbox extends Component {
	constructor() {
		super( ...arguments );

		this.trySandbox = this.trySandbox.bind( this );
		this.checkMessageForResize = this.checkMessageForResize.bind( this );

		this.iframe = createRef();

		this.state = {
			width: 0,
			height: 0,
		};
	}

	componentDidMount() {
		this.trySandbox();
	}

	componentDidUpdate() {
		this.trySandbox();
	}

	isFrameAccessible() {
		try {
			return !! this.iframe.current.contentDocument.body;
		} catch ( e ) {
			return false;
		}
	}

	checkMessageForResize( event ) {
		const iframe = this.iframe.current;

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

		// Update the state only if the message is formatted as we expect, i.e.
		// as an object with a 'resize' action, width, and height
		const { action, width, height } = data;
		const { width: oldWidth, height: oldHeight } = this.state;

		if ( 'resize' === action && ( oldWidth !== width || oldHeight !== height ) ) {
			this.setState( { width, height } );
		}
	}

	trySandbox() {
		if ( ! this.isFrameAccessible() ) {
			return;
		}

		const body = this.iframe.current.contentDocument.body;
		if ( null !== body.getAttribute( 'data-resizable-iframe-connected' ) ) {
			return;
		}

		const observeAndResizeJS = `
			( function() {
				var observer;
				var aspectRatio = false;
				var iframe = false;

				if ( ! window.MutationObserver || ! document.body || ! window.parent ) {
					return;
				}

				function sendResize() {
					var clientBoundingRect = document.body.getBoundingClientRect();
					var height = aspectRatio ? Math.ceil( clientBoundingRect.width / aspectRatio ) : clientBoundingRect.height;

					if ( iframe && aspectRatio ) {
						// This is embedded content delivered in an iframe with a fixed aspect ratio,
						// so set the height correctly and stop processing. The DOM mutation will trigger
						// another event and the resize message will get posted.
						if ( iframe.height != height ) {
							iframe.height = height;
							return;
						}
					}

					window.parent.postMessage( {
						action: 'resize',
						width: clientBoundingRect.width,
						height: height,
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
				document.body.style.width = '100%';
				document.body.setAttribute( 'data-resizable-iframe-connected', '' );

				// Make embedded content in an iframe with a fixed size responsive,
				// keeping the correct aspect ratio.
				var potentialIframe = document.body.children[0];
				if ( 'DIV' === potentialIframe.tagName || 'SPAN' === potentialIframe.tagName ) {
						potentialIframe = potentialIframe.children[0];
					}
				if ( 'IFRAME' === potentialIframe.tagName ) {
					if ( potentialIframe.width ) {
						iframe = potentialIframe;
						aspectRatio = potentialIframe.width / potentialIframe.height;
						potentialIframe.width = '100%';
					}
				}					

				sendResize();

				// Resize events can change the width of elements with 100% width, but we don't
				// get an DOM mutations for that, so do the resize when the window is resized, too.
				window.addEventListener( 'resize', sendResize, true );
		} )();`;

		const style = `
			body {
				margin: 0;
			}
			body > div > iframe {
				width: 100%;
			}
			body > div > * {
				margin-top: 0 !important;	/* has to have !important to override inline styles */
				margin-bottom: 0 !important;
			}
		`;

		// put the html snippet into a html document, and then write it to the iframe's document
		// we can use this in the future to inject custom styles or scripts
		const htmlDoc = (
			<html lang={ document.documentElement.lang }>
				<head>
					<title>{ this.props.title }</title>
					<style dangerouslySetInnerHTML={ { __html: style } } />
				</head>
				<body data-resizable-iframe-connected="data-resizable-iframe-connected" className={ this.props.type }>
					<div dangerouslySetInnerHTML={ { __html: this.props.html } } />
					<script type="text/javascript" dangerouslySetInnerHTML={ { __html: observeAndResizeJS } } />
				</body>
			</html>
		);

		// writing the document like this makes it act in the same way as if it was
		// loaded over the network, so DOM creation and mutation, script execution, etc.
		// all work as expected
		const iframeDocument = this.iframe.current.contentWindow.document;
		iframeDocument.open();
		iframeDocument.write( '<!DOCTYPE html>' + renderToString( htmlDoc ) );
		iframeDocument.close();
	}

	static get defaultProps() {
		return {
			html: '',
			title: '',
		};
	}

	render() {
		const { title } = this.props;

		return (
			<FocusableIframe
				iframeRef={ this.iframe }
				title={ title }
				scrolling="no"
				sandbox="allow-scripts allow-same-origin allow-presentation"
				onLoad={ this.trySandbox }
				width={ Math.ceil( this.state.width ) }
				height={ Math.ceil( this.state.height ) } />
		);
	}
}

Sandbox = withGlobalEvents( {
	message: 'checkMessageForResize',
} )( Sandbox );

export default Sandbox;
