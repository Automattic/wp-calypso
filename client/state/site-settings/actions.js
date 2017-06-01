/**
 * Internal dependencies
 */
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_UPDATE
} from 'state/action-types';

/**
 * Returns an action object to be used in signalling that site settings have been received.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} settings The site settings object
 * @return {Object}        Action object
 */
export function receiveSiteSettings( siteId, settings ) {
	return {
		type: SITE_SETTINGS_RECEIVE,
		siteId,
		settings
	};
}

/**
 * Returns an action object to be used in signalling that some site settings have been update.
 *
 * @param  {Number} siteId Site ID
 * @param  {Object} settings The updated site settings
 * @return {Object}        Action object
 */
export function updateSiteSettings( siteId, settings ) {
	return {
		type: SITE_SETTINGS_UPDATE,
		siteId,
		settings
	};
}

/**
 * Returns an action object to be used to trigger a network request to retrieve site settings.
 *
 * @param  {Number} siteId Site ID
 * @return {Object}        Action object
 */
export const requestSiteSettings = ( siteId ) => ( {
	type: SITE_SETTINGS_REQUEST,
	siteId
} );

/**
 * Returns an action object to be used to trigger a request to save site settings.
 *
 * @param  {Number} siteId   Site ID
 * @param  {Object} settings The new settings values to be saved
 * @return {Object}          Action object
 */
export const saveSiteSettings = ( siteId, settings ) => ( {
	type: SITE_SETTINGS_SAVE,
	siteId,
	settings
} );

