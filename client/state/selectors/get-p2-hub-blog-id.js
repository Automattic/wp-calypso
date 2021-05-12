/**
 * External dependencies
 */
import { get } from 'lodash';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Returns the P2 hub blog id for the site. If the site is a hub the id will be
 * the same as the site id.
 *
 * @param {object} state Global state tree
 * @param {number} siteId the site ID
 * @returns {number} % of file uploaded so far
 */
export default function getP2HubBlogId( state, siteId ) {
	if ( ! isSiteWPForTeams( state, siteId ) ) {
		return 0;
	}
	return get( state, [ 'sites', 'items', siteId, 'options', 'p2_hub_blog_id' ], 0 );
}
