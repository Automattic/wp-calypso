/** @format */
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

/**
 * Returns an array of page template objects for the specified site ID, or null
 * if the page templates are not known for the site.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @return {?Array}        Page template objects, if known
 */
export function getPageTemplates( state, siteId ) {
	return state.pageTemplates.items[ siteId ] || null;
}
