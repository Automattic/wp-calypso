/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	SITE_SETTINGS_RECEIVE,
	SITE_SETTINGS_REQUEST,
	SITE_SETTINGS_SAVE,
	SITE_SETTINGS_SAVE_FAILURE,
	SITE_SETTINGS_SAVE_SUCCESS,
	SITE_SETTINGS_UPDATE
} from 'state/action-types';
import { normalizeSettings } from './utils';

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

export function saveSiteSettings( siteId, settings ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_SETTINGS_SAVE,
			siteId
		} );

		return wpcom.undocumented().settings( siteId, 'post', settings )
			.then( ( { updated } ) => {
				dispatch( updateSiteSettings( siteId, normalizeSettings( updated ) ) );
				dispatch( {
					type: SITE_SETTINGS_SAVE_SUCCESS,
					siteId
				} );
			} )
			.catch( error => {
				dispatch( {
					type: SITE_SETTINGS_SAVE_FAILURE,
					siteId,
					error
				} );
			} );
	};
}
