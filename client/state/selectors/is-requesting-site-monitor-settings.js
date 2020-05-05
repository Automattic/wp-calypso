/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we are currently performing a request to fetch the site monitor settings.
 * False otherwise.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean}             Whether monitor settings is currently being requested for that site.
 */
export default function isRequestingSiteMonitorSettings( state, siteId ) {
	return get( state, [ 'sites', 'monitor', 'requesting', siteId ], false );
}
