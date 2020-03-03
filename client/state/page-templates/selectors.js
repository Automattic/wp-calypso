/**
 * Returns true if a request is in progress to retrieve the page templates for
 * the specified site, or false otherwise.
 *
 *
 * @param {number}  siteId Site ID
 * @returns {boolean}        Whether a request is in progress
 */

export function isRequestingPageTemplates( state, siteId ) {
	return !! state.pageTemplates.requesting[ siteId ];
}

/**
 * Returns an array of page template objects for the specified site ID, or null
 * if the page templates are not known for the site.
 *
 * @param  {object} state  Global state tree
 * @param  {number} siteId Site ID
 * @returns {?Array}        Page template objects, if known
 */
export function getPageTemplates( state, siteId ) {
	return state.pageTemplates.items[ siteId ] || null;
}
