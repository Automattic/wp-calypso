/**
 * External dependencies
 */

import { get } from 'lodash';

function getSettingsState( state ) {
	return state.extensions.wpSuperCache.settings;
}

/**
 * Returns true if we are requesting settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether settings are being requested
 */
export function isRequestingSettings( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'settings', 'requesting', siteId ], false );
}

/**
 * Returns true if we are restoring settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether settings are being restored
 */
export function isRestoringSettings( state, siteId ) {
	return get( getSettingsState( state ), [ 'restoring', siteId ], false );
}

/**
 * Returns true if we are saving settings for the specified site ID, false otherwise.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether settings are being saved
 */
export function isSavingSettings( state, siteId ) {
	return get(
		state,
		[ 'extensions', 'wpSuperCache', 'settings', 'saveStatus', siteId, 'saving' ],
		false
	);
}

/**
 * Returns true if the settings save request was successful.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean} Whether settings were saved successfully
 */
export function isSettingsSaveSuccessful( state, siteId ) {
	return getSettingsSaveStatus( state, siteId ) === 'success';
}

/**
 * Returns the settings for the specified site ID.
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId Site ID
 * @returns {object} Settings
 */
export function getSettings( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'settings', 'items', siteId ], null );
}

/**
 * Returns the status of the last settings save request.
 *
 * @param  {object}  state Global state tree
 * @param  {number}  siteId Site ID
 * @returns {string}  Save request status (pending, success or error)
 */
export function getSettingsSaveStatus( state, siteId ) {
	return get( state, [ 'extensions', 'wpSuperCache', 'settings', 'saveStatus', siteId, 'status' ] );
}
