/**
 * Returns true if a request is in progress to retrieve the page templates for
 * the specified site, or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether a request is in progress
 */
export function isRequestingPageTemplates( state, siteId ) {
	return !! state.pageTemplates.requesting[ siteId ];
}
