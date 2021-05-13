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
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether stats are being generated
 */
export function isGeneratingStats( state, siteId ) {
	return get( getStatsState( state ), [ 'generating', siteId ], false );
}

/**
 * Returns the stats for the specified site ID.
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @returns {object} Stats
 */
export function getStats( state, siteId ) {
	return get( getStatsState( state ), [ 'items', siteId ], null );
}

/**
 * Returns true if we are deleting a cached file for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether the cached file is being deleted
 */
export function isDeletingFile( state, siteId ) {
	return get( getStatsState( state ), [ 'deleting', siteId ], false );
}
