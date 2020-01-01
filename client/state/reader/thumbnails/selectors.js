/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Returns the url for a thumbnail for a given iframe.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  iframeSrc iframeSrc
 * @return {string}  url you can find the thumbnail at
 */
export function getThumbnailForIframe( state, iframeSrc ) {
	return state.reader.thumbnails.items[ iframeSrc ];
}

/**
 * Returns true if a request is in progress to retrieve the thumbnailUrl
 * for a given iframe.
 *
 * @param  {object}  state  Global state tree
 * @param  {string}  iframeSrc iframeSrc
 * @return {boolean} Whether a request is in progress
 */
export function isRequestingThumbnailUrl( state, iframeSrc ) {
	return !! state.reader.thumbnails.requesting[ iframeSrc ];
}
