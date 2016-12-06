/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_SETTINGS_RECEIVE,
	JETPACK_MODULE_SETTINGS_REQUEST,
	JETPACK_MODULE_SETTINGS_REQUEST_FAILURE,
	JETPACK_MODULE_SETTINGS_REQUEST_SUCCESS
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
			.then( ( settings ) => {
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
