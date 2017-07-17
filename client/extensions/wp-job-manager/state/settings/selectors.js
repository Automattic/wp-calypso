/**
 * External dependencies
 */
import { get } from 'lodash';

function getSettingsState( state ) {
	return state.extensions.wpJobManager.settings;
}

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether settings are being requested
 */
export function isRequestingSettings( state, siteId ) {
	return get( getSettingsState( state ), [ 'requesting', siteId ], false );
}

/**
 * Returns true if we are saving settings for the specified site ID, false otherwise.
 *
 * @param  {Object}  state Global state tree
 * @param  {Number}  siteId Site ID
 * @return {Boolean} Whether settings are being saved
 */
export function isSavingSettings( state, siteId ) {
	return get( getSettingsState( state ), [ 'saving', siteId ], false );
}

/**
 * Returns the settings for the specified site ID.
 *
 * @param  {Object} state Global state tree
 * @param  {Number} siteId Site ID
 * @return {Object} Settings
 */
export function getSettings( state, siteId ) {
	return get( getSettingsState( state ), [ 'items', siteId ], {} );
}
