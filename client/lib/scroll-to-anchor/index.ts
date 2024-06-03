import scrollTo from 'calypso/lib/scroll-to';

// Danger! Recursive
// (relatively safe since the DOM tree is only so deep)
function getOffsetTop( element: HTMLElement, container?: HTMLElement ): number {
	const offset = element.offsetTop;

	if ( container ) {
		return (
			container.scrollTop +
			element.getBoundingClientRect().top -
			container.getBoundingClientRect().top
		);
	}

	if ( element.offsetParent ) {
		return offset + getOffsetTop( element.offsetParent as HTMLElement );
	}

	return offset;
}

/**
 * Scrolls to the anchor location
 *
 * Wait for page.js to update the URL, then see if we are linking
 * directly to a section of this page.
 */
export default function scrollToAnchor( options: { offset: number; container?: HTMLElement } ) {
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
		const y = getOffsetTop( el, options.container ) - offsetHeight - offset;
		scrollTo( { y, container: options.container } );
	}
}
