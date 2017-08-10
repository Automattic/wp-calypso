/** @format */
/**
 * Returns true if currently requesting post formats for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether post formats are being requested
 */
export function isRequestingPostFormats( state, siteId ) {
	return !! state.postFormats.requesting[ siteId ];
}

/**
 * Returns the supported post formats for a site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {?Object}        Site post formats
 */
export function getPostFormats( state, siteId ) {
	return state.postFormats.items[ siteId ] || null;
}
