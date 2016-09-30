/**
 * Returns true if requesting user suggestions for the specified site ID, or
 * false otherwise.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         Whether user suggestions are being requested
 */
export function isRequestingUserSuggestions( state, siteId ) {
	return !! state.users.suggestions.requesting[ siteId ];
}

/**
 * Returns the user suggestions for a site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {?Object}         Site user suggestions
 */
export function getUserSuggestions( state, siteId ) {
	return state.users.suggestions.items[ siteId ] || null;
}
