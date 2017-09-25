/**
 * Internal dependencies
 */
import { WP_JOB_MANAGER_FETCH_ERROR, WP_JOB_MANAGER_FETCH_SETTINGS, WP_JOB_MANAGER_SAVE_SETTINGS, WP_JOB_MANAGER_UPDATE_SETTINGS } from '../action-types';

/**
 * Returns an action object to indicate that a request has been made to fetch the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchSettings = siteId => ( { type: WP_JOB_MANAGER_FETCH_SETTINGS, siteId } );

/**
 * Returns an action object to indicate that an error was received when fetching the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchError = siteId => ( { type: WP_JOB_MANAGER_FETCH_ERROR, siteId } );

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
 * @param  {Object} form Form name
 * @param  {Object} data Settings
 * @return {Object} Action object
 */
export const saveSettings = ( siteId, form, data ) => ( { type: WP_JOB_MANAGER_SAVE_SETTINGS, siteId, form, data } );
