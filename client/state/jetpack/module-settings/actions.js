/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_SETTINGS_RECEIVE,
	JETPACK_MODULE_SETTINGS_REQUEST,
	JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
	JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE,
	JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
	JETPACK_MODULE_SETTINGS_UPDATE_FAILURE
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Fetch the settings of a module for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @param  {String}   moduleSlug  Slug of the module.
 * @return {Function}             Action thunk to fetch the module settings when called.
 */
export const fetchModuleSettings = ( siteId, moduleSlug ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_SETTINGS_REQUEST,
			siteId,
			moduleSlug
		} );

		return wp.undocumented().fetchJetpackModuleSettings( siteId, moduleSlug )
			.then( ( response ) => {
				const settings = response.data || {};
				dispatch( {
					type: JETPACK_MODULE_SETTINGS_RECEIVE,
					siteId,
					moduleSlug,
					settings
				} );
				dispatch( {
					type: JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS,
					moduleSlug,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
					siteId,
					moduleSlug,
					error: error.message
				} );
			} );
	};
};

/**
 * Update the settings of a module for a certain site.
 *
 * @param  {Int}      siteId      ID of the site.
 * @param  {String}   moduleSlug  Slug of the module.
 * @param  {Object}   settings    New module settings.
 * @return {Function}             Action thunk to update the module settings when called.
 */
export const updateModuleSettings = ( siteId, moduleSlug, settings ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_SETTINGS_UPDATE,
			siteId,
			moduleSlug,
			settings
		} );

		return wp.undocumented().updateJetpackModuleSettings( siteId, moduleSlug, settings )
			.then( () => {
				dispatch( {
					type: JETPACK_MODULE_SETTINGS_UPDATE_SUCCESS,
					siteId,
					moduleSlug,
					settings
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULE_SETTINGS_UPDATE_FAILURE,
					siteId,
					moduleSlug,
					settings,
					error: error.message
				} );
			} );
	};
};
