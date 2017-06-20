/**
 * Internal dependencies
 */
import {
	WP_JOB_MANAGER_DISPLAY_SETTINGS,
	WP_JOB_MANAGER_ENABLE_SETTINGS,
	WP_JOB_MANAGER_FETCH_SETTINGS,
} from '../action-types';

/**
 * Returns an action object to indicate that the settings should be displayed.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} data WPJM settings
 * @return {Object} Action object
 */
export const displaySettings = ( siteId, data ) => ( { type: WP_JOB_MANAGER_DISPLAY_SETTINGS, siteId, data } );

/**
 * Returns an action object to indicate that the settings should be enabled.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const enableSettings = siteId => ( { type: WP_JOB_MANAGER_ENABLE_SETTINGS, siteId } );

/**
 * Returns an action object to indicate that a request has been made to fetch the settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object} Action object
 */
export const fetchSettings = siteId => ( { type: WP_JOB_MANAGER_FETCH_SETTINGS, siteId } );
