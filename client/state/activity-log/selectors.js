/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the activity log data for a given site
 * Returns null if the site is unknown, or activity logs have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {?Array}          Activity Log items
 */
export function getActivityLog( state, siteId ) {
	return get( state.activityLog.items, [ siteId ], {} );
}

/**
 * Returns true if we are currently making a request to get the list of Jetpack
 * modules on the site. False otherwise.
 * Returns null if the status for queried site and module is unknown.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId The ID of the site we're querying
 * @return {?Boolean}         Whether the list is being requested
 */
export function isFetchingActivityLog( state, siteId ) {
	return get( state.activityLog.requests, [ siteId, 'isRequesting' ], null );
}

