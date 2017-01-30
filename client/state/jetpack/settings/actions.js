/**
 * Internal dependencies
 */
import {
	JETPACK_SETTINGS_RECEIVE,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
	JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
	JETPACK_SETTINGS_REQUEST,
	JETPACK_SETTINGS_REQUEST_FAILURE,
	JETPACK_SETTINGS_REQUEST_SUCCESS,
	JETPACK_SETTINGS_UPDATE,
	JETPACK_SETTINGS_UPDATE_SUCCESS,
	JETPACK_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import wp from 'lib/wp';
import { normalizeSettings, sanitizeSettings, filterSettingsByActiveModules } from './utils';

/**
 * Fetch the Jetpack settings for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @return {Function}             Action thunk to fetch the Jetpack settings when called.
 */
export const fetchSettings = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SETTINGS_REQUEST,
			siteId
		} );

		return wp.undocumented().fetchJetpackSettings( siteId )
			.then( ( response ) => {
				const settings = normalizeSettings( response.data ) || {};
				dispatch( {
					type: JETPACK_SETTINGS_RECEIVE,
					siteId,
					settings
				} );
				dispatch( {
					type: JETPACK_SETTINGS_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_SETTINGS_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};

/**
 * Update the Jetpack settings for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @param  {Object}   settings    New settings.
 * @return {Function}             Action thunk to update the Jetpack settings when called.
 */
export const updateSettings = ( siteId, settings ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SETTINGS_UPDATE,
			siteId,
			settings
		} );

		return wp.undocumented().updateJetpackSettings( siteId, filterSettingsByActiveModules( sanitizeSettings( settings ) ) )
			.then( () => {
				dispatch( {
					type: JETPACK_SETTINGS_UPDATE_SUCCESS,
					siteId,
					settings
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_SETTINGS_UPDATE_FAILURE,
					siteId,
					settings,
					error: error.message
				} );
			} );
	};
};

/**
 * Regenerate the target email of Post by Email.
 *
 * @param  {Int}      siteId      ID of the site.
 * @return {Function}             Action thunk to regenerate the email when called.
 */
export const regeneratePostByEmail = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL,
			siteId,
		} );

		return wp.undocumented().updateJetpackSettings( siteId, { post_by_email_address: 'regenerate' } )
			.then( ( { data } ) => {
				dispatch( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_SUCCESS,
					siteId,
					email: data.post_by_email_address
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_SETTINGS_REGENERATE_POST_BY_EMAIL_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};
