/**
 * Internal dependencies
 */
import getSiteSetting from 'state/selectors/get-site-setting';

/**
 * Returns the ID of the static page set as the front page, or 0 if a static page is not set.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Number} ID of the static page set as the front page, or 0 if a static page is not set
 */
export default function getSiteFrontPage( state, siteId ) {
	return getSiteSetting( state, siteId, 'page_on_front' );
}
