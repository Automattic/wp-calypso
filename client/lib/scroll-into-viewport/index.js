/**
 * Walks from a given node with `nextNodeProp` as the next node in a graph, summing the values in `valueProp`.
 * e.g. recursivelyWalkAndSum( node, 'offsetTop', 'offsetParent' ).
 *
 * @format
 * @param {number} [value=0} - The initial value
 * @returns {number} - Summed value at the end of the walk
 */

function recursivelyWalkAndSum( node, valueProp, nextNodeProp, value = 0 ) {
	value += node[ valueProp ];
	if ( ! node[ nextNodeProp ] ) {
		return value;
	}
	return recursivelyWalkAndSum( node[ nextNodeProp ], valueProp, value );
}

/**
 * Checks whether the given bounds are within the viewport
 * @param {number} elementStart
 * @param {number} elementEnd
 * @returns {boolean}
 */
function isInViewportRange( elementStart, elementEnd ) {
	let viewportStart = window.scrollY,
		viewportEnd = document.documentElement.clientHeight + window.scrollY;
	return elementStart > viewportStart && elementEnd < viewportEnd;
}

/**
 * Scroll an element into the viewport if it's not already inside the viewport
 * @param {HTMLElement} element
 */
function scrollIntoViewport( element ) {
	let elementStartY = recursivelyWalkAndSum( element, 'offsetTop', 'offsetParent' ),
		elementEndY = elementStartY + element.offsetHeight;
	! isInViewportRange( elementStartY, elementEndY ) && window.scrollTo( 0, elementStartY );
}

export default scrollIntoViewport;
