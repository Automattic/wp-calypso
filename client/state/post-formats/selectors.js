/**
 * Internal dependencies
 */
import 'calypso/state/post-formats/init';

/**
 * Returns true if currently requesting post formats for the specified site ID, or
 * false otherwise.
 *
 * @param {object}  state  Global state tree
 * @param {number}  siteId Site ID
 * @returns {boolean}        Whether post formats are being requested
 */
export function isRequestingPostFormats( state, siteId ) {
	return !! state.postFormats.requesting[ siteId ];
}

/**
 * Returns the supported post formats for a site.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {?object}        Site post formats
 */
export function getPostFormats( state, siteId ) {
	return state.postFormats.items[ siteId ] || null;
}
