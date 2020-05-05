/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns the site monitor settings of a site.
 * Returns null if the site is unknown, or monitor settings haven't been received yet.
 *
 * @param  {object}    state   Global state tree
 * @param  {number}    siteId  The ID of the site we're querying
 * @returns {?object}           The monitor settings of that site
 */
export default function getSiteMonitorSettings( state, siteId ) {
	return get( state, [ 'sites', 'monitor', 'items', siteId ], null );
}
