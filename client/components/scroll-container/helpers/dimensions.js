let scrollbarWidth = null;

/**
 * Calculate the width of the browser's scrollbar.  If the scrollbar width can't be calculated
 * for some reason, zero is returned, but not cached.  If you want to force this function to
 * recalcuate the scrollbar width, pass true into the function.
 *
 * @export
 * @param {Boolean} recalculate - Pass true to force recalculation of the scrollbar width
 * @returns {Number} Width of the browser scrollbar or 0 if it can't be calculated
 */
export const getScrollbarWidth = recalculate => {
	if ( typeof window !== 'undefined' ) {
		if ( recalculate == null ) {
			recalculate = false;
		}
		if ( ( scrollbarWidth != null ) && ! recalculate ) {
			return scrollbarWidth;
		}
		if ( document.readyState === 'loading' ) {
			return 0;
		}
		const div1 = document.createElement( 'div' );
		const div2 = document.createElement( 'div' );
		div1.style.width = div2.style.width = div1.style.height = div2.style.height = '100px';
		div1.style.overflowY = 'scroll';
		div2.style.overflow = 'hidden';
		document.body.appendChild( div1 );
		document.body.appendChild( div2 );
		scrollbarWidth = Math.abs( div1.scrollWidth - div2.scrollWidth );
		document.body.removeChild( div1 );
		document.body.removeChild( div2 );
		return scrollbarWidth;
	}
	return 0;
};

/**
 * Determine if the scrollbar actually affects layout.
 *
 * @export
 * @returns {Boolean} Whether or not the vertical scrollbar has any width.
 */
export const scrollbarHasLayout = () => !! getScrollbarWidth();

/**
 * Determine the amount of the content container needs to be clipped in order for the vertical
 * scrollbar hidden from view.
 *
 * @export
 * @returns {Number} The amount of clipping necessary to hide a scrollbar
 */
export const getScrollbarClipWidth = () => getScrollbarWidth() || 15;

/**
 * Determine the size of the scroll puck (draggable element of the scroll bar) given the
 * amount of visible space and total size of content along a dimension.  The direction the
 * user is allowed to scroll is also needed, due to the restricted amount of available space
 * for the puck to traverse on the track if the user is allowed to scroll in both dimensions.
 *
 * @export
 * @param {Number} visibleSize - The number of visible pixels in the direction you care about
 * @param {Number} totalSize - The total number of pixels that the content takes up
 * @param {Number} trackMargin - The amount of space between the track and the edge of the scrollable area
 * @returns {Number} The size of the puck in pixels
 */
export function calcPuckSize( visibleSize, totalSize, trackMargin ) {
	return Math.max( Math.min( Math.round( ( visibleSize - ( trackMargin * 2 ) ) / totalSize * visibleSize ), visibleSize ), 0 );
}

/**
 * Determine the pixel offset of the puck from the base of the track given how much the
 * user has scrolled.  The direction the user is allowed to scroll is also needed, due to
 * the restricted amount of available space for the puck to traverse on the track if the
 * user is allowed to scroll in both dimensions.
 *
 * @export
 * @param {Number} visibleSize - The number of visible pixels in the direction you care about
 * @param {Number} totalSize - The total number of pixels that the content takes up
 * @param {Number} scrollAmount - The number of pixels the user has scrolled in a given dimension
 * @param {Number} trackMargin - The amount of space between the track and the edge of the scrollable area
 * @returns {Number} The offset of the puck from the track base in pixels
 */
export function calcPuckOffset( visibleSize, totalSize, scrollAmount, trackMargin ) {
	const puckSize = calcPuckSize( visibleSize, totalSize, trackMargin );
	const visibleSizeAvailable = visibleSize - trackMargin * 2;
	const maxOffset = visibleSizeAvailable - puckSize;
	const proportionScrolled = scrollAmount / totalSize;
	return Math.max( Math.min( Math.round( visibleSizeAvailable * proportionScrolled ), maxOffset ), 0 );
}
