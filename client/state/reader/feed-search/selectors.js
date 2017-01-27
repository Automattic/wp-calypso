/**
 * External dependencies
 */

/**
 * Internal dependencies
 */

/**
 * Returns the url for a thumbnail for a given iframe.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  query query
 * @return {Array} list of feeds that are the result of that query
 */
export function getFeedsForQuery( state, query ) {
	return state.reader.feedSearch.items[ query ];
}

/**
 * Returns true if a request is in progress to retrieve the thumbnailUrl
 * for a given iframe.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  iframeSrc iframeSrc
 * @return {Boolean} Whether a request is in progress
 */
export function isRequestingFeedSearch( state, query ) {
	return !! state.reader.feedSearch.requesting[ query ];
}
