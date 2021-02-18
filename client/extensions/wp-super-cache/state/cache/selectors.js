/**
 * External dependencies
 */

import { get } from 'lodash';

function getCacheState( state ) {
	return state.extensions.wpSuperCache.cache;
}

/**
 * Returns true if we are deleting the cache for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether the cache is being deleted
 */
export function isDeletingCache( state, siteId ) {
	return get(
		state,
		[ 'extensions', 'wpSuperCache', 'cache', 'deleteStatus', siteId, 'deleting' ],
		false
	);
}

/**
 * Returns true if the cache delete request was successful.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether the cache delete request was successful
 */
export function isCacheDeleteSuccessful( state, siteId ) {
	return getCacheDeleteStatus( state, siteId ) === 'success';
}

/**
 * Returns the status of the last cache delete request.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string}  Delete request status (pending, success or error)
 */
export function getCacheDeleteStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'cache', 'deleteStatus', siteId, 'status' ] );
}

/**
 * Returns true if we are testing the cache for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether the cache is being tested
 */
export function isTestingCache( state, siteId ) {
	return get( getCacheState( state ), [ 'testing', siteId ], false );
}

/**
 * Returns the cache test results for the specified site ID.
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @returns {object} Cache test results
 */
export function getCacheTestResults( state, siteId ) {
	return get( getCacheState( state ), [ 'items', siteId ], {} );
}

/**
 * Returns true if we are preloading the cache for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether the cache is being preloaded
 */
export function isPreloadingCache( state, siteId ) {
	return get( getCacheState( state ), [ 'preloading', siteId ], false );
}
