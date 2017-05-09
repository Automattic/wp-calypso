/**
 * External dependencies
 */
import { get } from 'lodash';

function getStatsState( state ) {
	return get( state, 'extensions.wpSuperCache.stats', {} );
}

/**
 * Returns true if we are generating stats for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether stats are being generated
 */
export function isGeneratingStats( state, siteId ) {
	return get( getStatsState( state ), [ 'generateStatus', siteId, 'generating' ], false );
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
	return get( getStatsState( state ), [ 'generateStatus', siteId, 'status' ] );
}

/**
 * Returns the stats for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Stats
 */
export function getStats( state, siteId ) {
	return get( getStatsState( state ), [ 'items', siteId ], null );
}

/**
 * Returns true if we are deleting a cached file for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether the cached file is being deleted
 */
export function isDeletingFile( state, siteId ) {
	return get( getStatsState( state ), [ 'deleteStatus', siteId, 'deleting' ], false );
}

/**
 * Returns true if the file delete request failed.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether the file delete request encountered an error
 */
export function hasFileDeleteError( state, siteId, ) {
	return getFileDeleteStatus( state, siteId ) === 'error';
}

/**
 * Returns the status of the last file delete request.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {String}  Delete request status (pending, success or error)
 */
export function getFileDeleteStatus( state, siteId ) {
	return get( getStatsState( state ), [ 'deleteStatus', siteId, 'status' ] );
}
