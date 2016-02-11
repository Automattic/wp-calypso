/**
 * Returns true if current requesting post types for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether post types are being requested
 */
export function isRequestingPostTypes( state, siteId ) {
	return !! state.postTypes.requesting[ siteId ];
}
