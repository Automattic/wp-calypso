/**
 * External dependencies
 */

import { get } from 'lodash';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';

/**
 * Returns true if site is a WP for Teams hub, false if not and null if unknown.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is a WP for Teams site hub
 */
export default function isSiteWPForTeamsHub( state, siteId ) {
	if ( ! isSiteWPForTeams( state, siteId ) ) {
		return false;
	}
	return siteId === get( state, [ 'sites', 'items', siteId, 'options', 'p2_hub_blog_id' ], null );
}
