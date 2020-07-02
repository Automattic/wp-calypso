/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { adminSections, filterListBySearchTerm } from 'blocks/inline-help/admin-sections';

/**
 * Returns a filtered site admin collection using the memoized adminSections.
 *
 * Note that the first argument `state` is not used,
 * because the admin sections are store in the admin-sections.js,
 * in the inline-block component.
 *
 * @param   {object} state  Global state tree
 * @param   {String} searchTerm The search term
 * @param   {String} siteSlug   The current site slug
 * @param   {Number} limit      The maximum number of results to show
 * @returns {Array}             A filtered (or empty) array
 */
export default function getAdminHelpResults( state, searchTerm = '', siteSlug, limit ) {
	if ( ! searchTerm ) {
		return [];
	}

	return filterListBySearchTerm( searchTerm, adminSections( siteSlug || '' ), limit );
}
