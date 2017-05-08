/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently performing a request to fetch the site monitor settings.
 * False otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}             Whether monitor settings is currently being requested for that site.
 */
export default function isRequestingSiteMonitorSettings( state, siteId ) {
	return get( state, [ 'sites', 'monitor', 'requesting', siteId ], false );
}
