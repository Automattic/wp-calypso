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
export default function getComingSoonPageId( state, siteId ) {
	return getSiteOption( state, siteId, 'wpcom_coming_soon_page_id' );
}
