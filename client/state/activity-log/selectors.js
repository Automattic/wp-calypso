/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the status of Rewind
 * Returns null if the site is unknown
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {Array}           Rewind status items
 */
export function getRewindStatus( state, siteId ) {
	return get( state.activityLog.status, [ siteId, 'data' ], {} );
}

/**
 * Returns the error object from the Rewind status
 * Returns null if the site is unknown
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {Object}          Rewind error object
 */
export function getRewindStatusError( state, siteId ) {
	return get( state.activityLog.status, [ siteId, 'data', 'error' ], {} );
}

/**
 * Is Rewind active for this site?
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {Boolean}         True if active, false if not.
 */
export function isRewindActive( state, siteId ) {
	return get( state.activityLog.status, [ siteId, 'data', 'use_rewind' ], false );
}

/**
 * Returns the date of the first available rewind point
 * Returns null if the site is unknown
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {String|Boolean}  Date of the first rewind point, false if not found.
 */
export function getRewindStartDate( state, siteId ) {
	return get( state.activityLog.status, [ siteId, 'data', 'first_backup_when' ], false );
}

/**
 * Returns true if we are currently making a request to get status of Rewind
 * modules on the site. False otherwise.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {Boolean}         Whether the status is being requested
 */
export function isFetchingRewindStatus( state, siteId ) {
	return !! get( state.activityLog.requests, [ siteId, 'isRequestingRewindStatus' ], false );
}

/**
 * Returns the activity log data for a given site
 * Returns null if the site is unknown, or activity logs have not been fetched yet.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @return {Array}          Activity Log items
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
 * @return {Boolean}         Whether the list is being requested
 */
export function isFetchingActivityLog( state, siteId ) {
	return get( state.activityLog.requests, [ siteId, 'isRequesting' ], null );
}

/**
 * Returns true while a specific backup identified by a timestamp is being restored. False otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the site we're backing up.
 * @param  {string}     timestamp Time stamp that identifies the backup to restore.
 * @return {Boolean}           Whether the site is being backed up.
 */
export function isRestoring( state, siteId, timestamp ) {
	return timestamp === get( state.activityLog.requests, [ siteId, 'isRestoring' ], '' );
}

/**
 * Returns true while the site is being backed up. False otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the site we're backing up.
 * @return {Boolean}           Whether the site is being backed up.
 */
export function isAnythingRestoring( state, siteId ) {
	return !! get( state.activityLog.requests, [ siteId, 'isRestoring' ], false );
}

/**
 * Returns true while a Rewind is being activated/deactivated
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the site we're activating/deactivating.
 * @return {Boolean}           Whether the site is being toggled.
 */
export function isTogglingRewind( state, siteId ) {
	return !! get( state.activityLog.requests, [ siteId, 'isTogglingRewind' ], false );
}

/**
 * Returns true while a Rewind is being activated
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the site we're activating.
 * @return {Boolean}           Whether the site is being activated.
 */
export function isActivatingRewind( state, siteId ) {
	return !! get( state.activityLog.requests, [ siteId, 'isActivatingRewind' ], false );
}

/**
 * Returns true while a Rewind is being deactivated
 *
 * @param  {Object}  state     Global state tree
 * @param  {Number}  siteId    The ID of the site we're deactivating.
 * @return {Boolean}           Whether the site is being deactivated.
 */
export function isDeactivatingRewind( state, siteId ) {
	return !! get( state.activityLog.requests, [ siteId, 'isDeactivatingRewind' ], false );
}

