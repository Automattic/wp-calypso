import scrollTo from 'calypso/lib/scroll-to';

// Danger! Recursive
// (relatively safe since the DOM tree is only so deep)
function getOffsetTop( element ) {
	const offset = element.offsetTop;

	return element.offsetParent ? offset + getOffsetTop( element.offsetParent ) : offset;
}

/**
 * Scrolls to the anchor location
 *
 * Wait for page.js to update the URL, then see if we are linking
 * directly to a section of this page.
 *
 * @param {Object} options - options object (see below)
 * @param {number} [options.offset] - desired offset
 */
export default function scrollToAnchor( options ) {
	const offset = options.offset;

	if ( ! window || ! window.location ) {
		// This code breaks everything in the tests (they hang with no
		// error message).
		return;
	}

	const hash = window.location.hash;
	const el = hash && document.getElementById( hash.substring( 1 ) );

	if ( hash && el ) {
		const y = getOffsetTop( el ) - document.getElementById( 'header' ).offsetHeight - offset;
		scrollTo( { y } );
	}
}
