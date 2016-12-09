/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site settings is being requested
 */
export function isRequestingSiteSettings( state, siteId ) {
	return get( state.siteSettings.requesting, [ siteId ], false );
}

/**
 * Returns true if we are saving settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean}        Whether site settings is being requested
 */
export function isSavingSiteSettings( state, siteId ) {
	return get( state.siteSettings.saving, [ siteId ], false );
}

/**
 * Returns the settings for the specified site ID
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Object}        Site settings
 */
export function getSiteSettings( state, siteId ) {
	return get( state.siteSettings.items, [ siteId ], null );
}
