/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are generating stats for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether stats are being generated
 */
export function isGeneratingStats( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'stats', 'generateStatus', siteId, 'generating' ], false );
}

/**
 * Returns true if the stats were generated successfully.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether the stats generation was successful
 */
export function isStatsGenerationSuccessful( state, siteId ) {
	return getStatsGenerationStatus( state, siteId ) === 'success';
}

/**
 * Returns the status of the last stats generation request.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}  Stats generation request status (pending, success or error)
 */
export function getStatsGenerationStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'stats', 'generateStatus', siteId, 'status' ] );
}

/**
 * Returns the stats for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Stats
 */
export function getStats( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'stats', 'items', siteId ], null );
}
