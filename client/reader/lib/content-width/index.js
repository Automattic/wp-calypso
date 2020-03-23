/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
const PAGE_MARGIN_LARGE = 32 * 2;
const PAGE_MARGIN_MEDIUM = 24 * 2;
const PAGE_MARGIN_SMALL = 10 * 2;
const SIDEBAR_WIDTH = 240;
const MAX_CONTENT_WIDTH = 720;

/**
 * Returns the available content width in full post for the reader at the current viewport width
 *
 * @returns {[type]} [description]
 */
export default function contentWidth() {
	if ( typeof document === 'undefined' ) {
		return undefined;
	}

	const clientWidth = document.documentElement.clientWidth;
	if ( clientWidth > 1040 ) {
		return MAX_CONTENT_WIDTH;
	}
	if ( clientWidth > 928 ) {
		return clientWidth - ( SIDEBAR_WIDTH + PAGE_MARGIN_LARGE );
	}
	if ( clientWidth > 660 ) {
		return clientWidth - ( SIDEBAR_WIDTH + PAGE_MARGIN_MEDIUM );
	}
	return clientWidth - PAGE_MARGIN_SMALL;
}
