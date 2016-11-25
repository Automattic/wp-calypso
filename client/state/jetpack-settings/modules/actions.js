/**
 * External dependencies
 */
import { keyBy } from 'lodash';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
	JETPACK_MODULES_RECEIVE,
	JETPACK_MODULES_REQUEST,
	JETPACK_MODULES_REQUEST_FAILURE,
	JETPACK_MODULES_REQUEST_SUCCESS
} from 'state/action-types';
import wp from 'lib/wp';

export const activateModule = ( siteId, moduleSlug ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_ACTIVATE,
			siteId,
			moduleSlug
		} );

		return wp.undocumented().jetpackModulesActivate( siteId, moduleSlug )
			.then( () => {
				dispatch( {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					error: error.message
				} );
			} );
	};
};

export const deactivateModule = ( siteId, moduleSlug ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_DEACTIVATE,
			siteId,
			moduleSlug
		} );

		return wp.undocumented().jetpackModulesDeactivate( siteId, moduleSlug )
			.then( () => {
				dispatch( {
					type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
					siteId,
					moduleSlug
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_MODULE_DEACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					error: error.message
				} );
			} );
	};
};

/**
 * Returns an action object used in signalling that the available modules
 * in a Jetpack site were received.
 *
 * @param  {Number}   siteId    Site ID
 * @param  {Object[]} modules Object of modules indexed by slug
 * @return {Object}             Action object
 */
export function receiveJetpackModules( siteId, modules ) {
	return {
		type: JETPACK_MODULES_RECEIVE,
		siteId,
		modules
	};
}

export const fetchModuleList = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULES_REQUEST,
			siteId
		} );

		return wp.undocumented().jetpackModules( siteId )
			.then( ( data ) => {
				const modules = keyBy( data.modules, 'id' );
				dispatch( receiveJetpackModules( siteId, modules ) );
				dispatch( {
					type: JETPACK_MODULES_REQUEST_SUCCESS,
					siteId
				} );
			} ).catch( error => {
				dispatch( {
					type: JETPACK_MODULES_REQUEST_FAILURE,
					siteId,
					error: error.message
				} );
			} );
	};
};
