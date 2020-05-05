/**
 * External dependencies
 */

import { get } from 'lodash';
/**
 * Returns true if site is a WP for Teams site, false if not and null if unknown
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is a WP for Teams site
 */
export default function isSiteWPForTeams( state, siteId ) {
	return get( state, [ 'sites', 'items', siteId, 'options', 'is_wpforteams_site' ], null );
}
