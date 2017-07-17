/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_REQUEST_SETTINGS,
	WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR,
	WP_JOB_MANAGER_SAVE_ERROR,
	WP_JOB_MANAGER_SAVE_SETTINGS,
	WP_JOB_MANAGER_SAVE_SUCCESS,
	WP_JOB_MANAGER_UPDATE_SETTINGS,
} from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const requestSettings = siteId => ( { type: WP_JOB_MANAGER_REQUEST_SETTINGS, siteId } );

/**
 * Returns an action object to indicate that an error was received when requesting the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const requestSettingsError = siteId => ( { type: WP_JOB_MANAGER_REQUEST_SETTINGS_ERROR, siteId } );

/**
 * Returns an action object to indicate that the settings should be updated.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data WPJM settings
 * @return {Object} Action object
 */
export const updateSettings = ( siteId, data ) => ( { type: WP_JOB_MANAGER_UPDATE_SETTINGS, siteId, data } );

/**
 * Returns an action object to indicate that the settings should be saved.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data WPJM settings
 * @return {Object} Action object
 */
export const saveSettings = ( siteId, data ) => ( { type: WP_JOB_MANAGER_SAVE_SETTINGS, siteId, data } );

/**
 * Returns an action object to indicate that an error was received when saving the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const saveError = siteId => ( { type: WP_JOB_MANAGER_SAVE_ERROR, siteId } );

/**
 * Returns an action object to indicate that the settings were successfully saved.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const saveSuccess = siteId => ( { type: WP_JOB_MANAGER_SAVE_SUCCESS, siteId } );
