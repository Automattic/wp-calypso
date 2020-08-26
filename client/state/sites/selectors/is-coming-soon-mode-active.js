/**
 * Internal dependencies
 */
import { getSiteOption } from 'state/sites/selectors';

/**
 * Returns the ID of the coming soon page, or 0 if not set.
 *
 * @param {object} state Global state tree
 * @param {object} siteId Site ID
 * @returns {number} ID of the static page set as the coming soon page, or 0 if not set
 */
export default function isComingSoonModeActive( state, siteId ) {
	return parseInt( getSiteOption( state, siteId, 'wpcom_coming_soon' ), 10 ) === 1;
}
