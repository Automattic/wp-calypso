/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the site name of the Rewind clone target site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId the clone source site ID
 * @return {?String} Destination site title for the current clone target
 */
export default function getRewindCloneDestinationSiteName( state, siteId ) {
	return get( state, [ 'activityLog', 'cloneDestination', siteId, 'destinationSiteName' ] );
}
