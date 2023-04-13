import { get } from 'lodash';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Returns true if site is a P2 hub, false otherwise.
 *
 * @param  {Object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {boolean}        Whether site is a WP for Teams site hub
 */
export default function isSiteP2Hub( state, siteId ) {
	if ( ! isSiteWPForTeams( state, siteId ) ) {
		return false;
	}
	return siteId === get( state, [ 'sites', 'items', siteId, 'options', 'p2_hub_blog_id' ], false );
}
