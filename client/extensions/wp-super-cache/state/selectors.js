/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the settings for the specified site ID.
 *
 * @param  {Object} reduxState Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Settings
 */
export function getSettings( reduxState, siteId ) {
	const state = reduxState.extensions.wpSuperCache;

	return state ? get( state.items, [ siteId ], null ) : null;
}
