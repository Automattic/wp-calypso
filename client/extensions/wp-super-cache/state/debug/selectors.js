/**
 * External dependencies
 */
import { get } from 'lodash';

function getDebugState( state ) {
	return state.extensions.wpSuperCache.debug;
}

/**
 * Returns the list of debug logs for the specified site ID.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object} Object with debug log URLs as keys, and usernames as values
 */
export function getDebugLogs( state, siteId ) {
	return get( getDebugState( state ), [ 'items', siteId ], {} );
}

/**
 * Returns true if we are requesting debug logs for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether debug logs are being requested
 */
export function isRequestingDebugLogs( state, siteId ) {
	return get( getDebugState( state ), [ 'requesting', siteId ], false );
}

/**
 * Returns true if we are deleting a debug log file for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  filename Debug log filename
 * @return {Boolean} Whether the debug log is being deleted
 */
export function isDeletingDebugLog( state, siteId, filename ) {
	return get( getDebugState( state ), [ 'deleteStatus', siteId, filename ], false );
}
