/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are currently updating the site monitor settings.
 * False otherwise.
 *
 * @param  {Object}  state       Global state tree
 * @param  {Number}  siteId      The ID of the site we're querying
 * @return {Boolean}             Whether monitor settings are currently being updated for that site.
 */
export default function isUpdatingSiteMonitorSettings( state, siteId ) {
	return get( state.sites.monitor.updating, [ siteId ], false );
}
