/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  reduxState Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether settings are being requested
 */
export function isRequestingSettings( reduxState, siteId ) {
	const state = reduxState.extensions.wpSuperCache;

	return state ? get( state.requesting, [ siteId ], false ) : false;
}

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
