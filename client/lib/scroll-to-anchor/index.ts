import scrollTo from 'calypso/lib/scroll-to';

// Danger! Recursive
// (relatively safe since the DOM tree is only so deep)
function getOffsetTop( element: HTMLElement ): number {
	const offset = element.offsetTop;

	return element.offsetParent
		? offset + getOffsetTop( element.offsetParent as HTMLElement )
		: offset;
}

/**
 * Scrolls to the anchor location
 *
 * Wait for page.js to update the URL, then see if we are linking
 * directly to a section of this page.
 */
export default function scrollToAnchor( options: { offset: number } ) {
	const offset = options.offset;

	if ( ! window || ! window.location ) {
		// This code breaks everything in the tests (they hang with no
		// error message).
		return;
	}

	const hash = window.location.hash;
	const el = hash && document.getElementById( hash.substring( 1 ) );

	if ( hash && el ) {
		const offsetHeight = document.getElementById( 'header' )?.offsetHeight || 0;
		const y = getOffsetTop( el ) - offsetHeight - offset;
		scrollTo( { y } );
	}
}
