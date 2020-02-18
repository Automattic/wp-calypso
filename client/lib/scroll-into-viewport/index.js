const SUPPORTS_SCROLL_BEHAVIOR =
	typeof document !== 'undefined' &&
	document.documentElement &&
	'scrollBehavior' in document.documentElement.style;

// Walks from a given node with `nextNodeProp` as the next node in a graph, summing the values in `valueProp`.
// e.g. recursivelyWalkAndSum( node, 'offsetTop', 'offsetParent' ).
export function recursivelyWalkAndSum( node, valueProp, nextNodeProp, value = 0 ) {
	value += node[ valueProp ];
	if ( ! node[ nextNodeProp ] ) {
		return value;
	}
	return recursivelyWalkAndSum( node[ nextNodeProp ], valueProp, nextNodeProp, value );
}

/**
 * Checks whether the given bounds are within the viewport.
 *
 * @param {number} elementStart - The element start bound
 * @param {number} elementEnd - The element end bound
 * @returns {boolean} Boolean indicating whether the bounds are within the viewport
 */
function isInViewportRange( elementStart, elementEnd ) {
	const viewportStart = window.scrollY;
	const viewportEnd = document.documentElement.clientHeight + window.scrollY;
	return elementStart > viewportStart && elementEnd < viewportEnd;
}

/**
 * Implements a fallback mechanism to scroll an element into the viewport if it's not
 * already inside the viewport.
 *
 * @param {HTMLElement} element - The element to be scrolled into view.
 * @param {string} behavior - Whether to use a smooth or auto scroll behavior.
 * @param {string} scrollMode - Whether to always scroll, or only scroll when needed.
 */
function fallbackScrollIntoViewport( element, behavior, scrollMode ) {
	const elementStartY = recursivelyWalkAndSum( element, 'offsetTop', 'offsetParent' );
	const elementEndY = elementStartY + element.offsetHeight;

	if ( isInViewportRange( elementStartY, elementEndY ) && scrollMode === 'if-needed' ) {
		return;
	}

	try {
		window.scroll( { top: elementStartY, left: 0, behavior } );
	} catch ( e ) {
		window.scrollTo( 0, elementStartY );
	}
}

/**
 * Scroll an element into the viewport.
 *
 * @param {HTMLElement} element - The element to be scrolled into view.
 * @param {object} options - Options to use for the scrolling (same as the options for Element.scrollIntoView).
 */
export default function scrollIntoViewport( element, options = {} ) {
	const { behavior = 'auto', block = 'start', scrollMode = 'always', ...otherOptions } = options;

	if ( ! element ) {
		return;
	}

	if (
		element.scrollIntoViewIfNeeded &&
		( behavior === 'auto' || ! SUPPORTS_SCROLL_BEHAVIOR ) &&
		( block === 'center' || block === 'nearest' ) &&
		scrollMode === 'if-needed' &&
		otherOptions === undefined
	) {
		// We can use `scrollIntoViewIfNeeded` if it's available, we're not doing smooth scrolling
		// (either because we don't want it or because it's not available in the browser),
		// and we only want to scroll if needed.
		// Also, only the 'center' and 'nearest' block modes are supported.
		element.scrollIntoViewIfNeeded( block === 'center' );
		return;
	}

	if ( element.scrollIntoView ) {
		try {
			// Use element.scrollIntoView if available.
			// This is the most complete implementation in newer browsers.
			// However, in older browsers it may throw an error if the options object is not supported,
			// or it may simply treat it as a boolean and ignore the various options.
			element.scrollIntoView( options );
			return;
		} catch ( error ) {
			// Move on to fallback.
		}
	}

	// Low fidelity implementation of scrollIntoView. Always assumes block = 'start'.
	fallbackScrollIntoViewport( element, behavior, scrollMode );
}
