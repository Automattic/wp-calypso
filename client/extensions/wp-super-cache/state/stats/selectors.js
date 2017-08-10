/** @format */
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
	return get( getStatsState( state ), [ 'generating', siteId ], false );
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
	return get( getStatsState( state ), [ 'deleting', siteId ], false );
}
