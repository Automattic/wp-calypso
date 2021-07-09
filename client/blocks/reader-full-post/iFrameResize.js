// This file is maintainerd in `wp-includes/js/wp-embed.js` of WP.org.
// It actually waits for a message from the iFrame in the contents.
const Resize = () => {
	let supportedBrowser = false;
	let loaded = false;

	if ( document.querySelector ) {
		if ( window.addEventListener ) {
			supportedBrowser = true;
		}
	}

	/** @namespace wp */
	window.wp = window.wp || {};

	if ( window.wp.receiveEmbedMessage ) {
		return;
	}

	window.wp.receiveEmbedMessage = function ( e ) {
		const data = e.data;

		if ( ! data ) {
			return;
		}

		if ( ! ( data.secret || data.message || data.value ) ) {
			return;
		}

		if ( /[^a-zA-Z0-9]/.test( data.secret ) ) {
			return;
		}

		const iframes = document.querySelectorAll( 'iframe[data-secret="' + data.secret + '"]' );
		const blockquotes = document.querySelectorAll(
			'blockquote[data-secret="' + data.secret + '"]'
		);
		let i;
		let source;
		let height;
		let sourceURL;
		let targetURL;

		for ( i = 0; i < blockquotes.length; i++ ) {
			blockquotes[ i ].style.display = 'none';
		}

		for ( i = 0; i < iframes.length; i++ ) {
			source = iframes[ i ];

			if ( e.source !== source.contentWindow ) {
				continue;
			}

			source.removeAttribute( 'style' );

			/* Resize the iframe on request. */
			if ( 'height' === data.message ) {
				height = parseInt( data.value, 10 );
				if ( height > 1000 ) {
					height = 1000;
				} else if ( ~~height < 200 ) {
					height = 200;
				}

				source.height = height;
			}

			/* Link to a specific URL on request. */
			if ( 'link' === data.message ) {
				sourceURL = document.createElement( 'a' );
				targetURL = document.createElement( 'a' );

				sourceURL.href = source.getAttribute( 'src' );
				targetURL.href = data.value;

				/* Only continue if link hostname matches iframe's hostname. */
				if ( targetURL.host === sourceURL.host ) {
					if ( document.activeElement === source ) {
						window.top.location.href = data.value;
					}
				}
			}
		}
	};

	function onLoad() {
		if ( loaded ) {
			return;
		}

		loaded = true;

		const isIE10 = -1 !== navigator.appVersion.indexOf( 'MSIE 10' );
		const isIE11 = !! navigator.userAgent.match( /Trident.*rv:11\./ );
		const iframes = document.querySelectorAll( 'iframe.wp-embedded-content' );
		let iframeClone;
		let i;
		let source;
		let secret;

		for ( i = 0; i < iframes.length; i++ ) {
			source = iframes[ i ];

			if ( ! source.getAttribute( 'data-secret' ) ) {
				/* Add secret to iframe */
				secret = Math.random().toString( 36 ).substr( 2, 10 );
				source.src += '#?secret=' + secret;
				source.setAttribute( 'data-secret', secret );
			}

			/* Remove security attribute from iframes in IE10 and IE11. */
			if ( isIE10 || isIE11 ) {
				iframeClone = source.cloneNode( true );
				iframeClone.removeAttribute( 'security' );
				source.parentNode.replaceChild( iframeClone, source );
			}
		}
	}

	if ( supportedBrowser ) {
		window.addEventListener( 'message', window.wp.receiveEmbedMessage, false );
		document.addEventListener( 'DOMContentLoaded', onLoad, false );
		window.addEventListener( 'load', onLoad, false );
	}
};

export default Resize;
