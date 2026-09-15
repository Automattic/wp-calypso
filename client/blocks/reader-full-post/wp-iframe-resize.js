const ALLOWED_PROTOCOLS = [ 'http:', 'https:' ];

/**
 * Parse a URL the top window may be navigated to.
 * Anything that is not an absolute, credential-free web URL is rejected. A
 * `javascript:` URL, for instance, parses with the same `host` as the iframe
 * that requested it, while still executing script in the top document.
 * @param {string} value The URL to parse.
 * @returns {URL|null} The parsed URL, or null when it is not safe to navigate to.
 */
const parseNavigableURL = ( value ) => {
	if ( typeof value !== 'string' ) {
		return null;
	}

	let url;
	try {
		url = new URL( value );
	} catch {
		return null;
	}

	if ( ! ALLOWED_PROTOCOLS.includes( url.protocol ) || url.username || url.password ) {
		return null;
	}

	return url;
};

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
				const sourceURL = parseNavigableURL( source.getAttribute( 'src' ) );
				const targetURL = parseNavigableURL( data.value );

				/* Only continue if the target is a web URL on the iframe's own host. */
				if (
					sourceURL &&
					targetURL &&
					targetURL.host === sourceURL.host &&
					document.activeElement === source
				) {
					window.top.location.href = targetURL.href;
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
