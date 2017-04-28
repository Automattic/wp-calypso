/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are testing the cache for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether the cache is being tested
 */
export function isTestingCache( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'cache', 'testStatus', siteId, 'testing' ], false );
}

/**
 * Returns true if the cache test request was successful.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether the cache test request was successful
 */
export function isCacheTestSuccessful( state, siteId ) {
	return getCacheTestStatus( state, siteId ) === 'success';
}

/**
 * Returns the status of the last cache test request.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}  Cache test request status (pending, success or error)
 */
export function getCacheTestStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'cache', 'testStatus', siteId, 'status' ] );
}

/**
 * Returns the cache test results for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Cache test results
 */
export function getCacheTestResults( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'cache', 'items', siteId ] );
}
