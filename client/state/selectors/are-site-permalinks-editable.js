/**
 * Internal dependencies
 */

import { getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Determines if site's permalinks are editable
 *
 * @param {object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} true if the site's permalinks are editable
 */
export default function areSitePermalinksEditable( state, siteId ) {
	const permalinkStructure = getSiteOption( state, siteId, 'permalink_structure' );
	if ( ! permalinkStructure ) {
		return false;
	}

	return /\/%postname%\/?/.test( permalinkStructure );
}
