/**
 * This function is inspired by `wp-includes/js/wp-embed.js` of WP.org.
 * It actually waits for a message from within the iFrame.
 * The message will contain the actual height of the iFrame.
 * @param {Element} contentWrapper The content wrapper element.
 * @returns {Function} Remove event listener callback.
 */
const WPiFrameResize = ( contentWrapper ) => {
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
		const blockquotes = contentWrapper.querySelectorAll(
			'blockquote[data-secret="' + data.secret + '"]'
		);

		// Hide the blockquotes that come together with the iFrame.
		for ( let i = 0; i < blockquotes.length; i++ ) {
			blockquotes[ i ].style.display = 'none';
		}

		for ( let i = 0; i < iframes.length; i++ ) {
			const source = iframes[ i ];

			if ( e.source !== source.contentWindow ) {
				continue;
			}

			source.removeAttribute( 'style' );

			/* Resize the iframe on request. */
			if ( 'height' === data.message ) {
				let height = parseInt( data.value, 10 );
				if ( height > 1000 ) {
					// Avoid resizing past 1000px, acting more like a failsafe in case of infinite loops in resizing.
					height = 1000;
				}

				source.height = height;
			}

			/* Link to a specific URL on request. */
			if ( 'link' === data.message ) {
				const sourceURL = document.createElement( 'a' );
				const targetURL = document.createElement( 'a' );

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

	window.addEventListener( 'message', receiveEmbedMessage );

	return () => {
		window.removeEventListener( 'message', receiveEmbedMessage );
	};
};

export default WPiFrameResize;
