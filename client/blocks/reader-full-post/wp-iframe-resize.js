/**
 * This function is inspired by `wp-includes/js/wp-embed.js` of WP.org.
 * It actually waits for a message from within the iFrame.
 * The message will contain the actual height of the iFrame.
 *
 * @param {Element} contentWrapper The content wrapper element.
 * @param {boolean} removeListener When true, remove the listener instead of adding it.
 */
const WPiFrameResize = ( contentWrapper, removeListener ) => {
	const receiveEmbedMessage = function ( e ) {
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

		const iframes = contentWrapper.querySelectorAll( 'iframe[data-secret="' + data.secret + '"]' );
		const blockquotes = document.querySelectorAll(
			'blockquote[data-secret="' + data.secret + '"]'
		);
		let i;
		let source;
		let height;
		let sourceURL;
		let targetURL;

		// Hide the blockquotes that come together with the iFrame.
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

	if ( removeListener ) {
		window.removeEventListener( 'message', receiveEmbedMessage, false );
	} else {
		window.addEventListener( 'message', receiveEmbedMessage, false );
	}
};

export default WPiFrameResize;
