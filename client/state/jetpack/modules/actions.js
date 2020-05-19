/**
 * External dependencies
 */

import { omit, mapValues } from 'lodash';

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
	JETPACK_MODULES_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

export const activateModule = ( siteId, moduleSlug, silent = false ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_ACTIVATE,
			siteId,
			moduleSlug,
			silent,
		} );

		return wp
			.undocumented()
			.jetpackModuleActivate( siteId, moduleSlug )
			.then( () => {
				dispatch( {
					type: JETPACK_MODULE_ACTIVATE_SUCCESS,
					siteId,
					moduleSlug,
					silent,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					silent,
					error: error.message,
				} );
			} );
	};
};

export const deactivateModule = ( siteId, moduleSlug, silent = false ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULE_DEACTIVATE,
			siteId,
			moduleSlug,
			silent,
		} );

		return wp
			.undocumented()
			.jetpackModuleDeactivate( siteId, moduleSlug )
			.then( () => {
				dispatch( {
					type: JETPACK_MODULE_DEACTIVATE_SUCCESS,
					siteId,
					moduleSlug,
					silent,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULE_DEACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					silent,
					error: error.message,
				} );
			} );
	};
};

/**
 * Returns an action object used in signalling that the available modules
 * in a Jetpack site were received.
 *
 * @param  {number}   siteId    Site ID
 * @param  {object[]} modules Object of modules indexed by slug
 * @returns {object}             Action object
 */
export function receiveJetpackModules( siteId, modules ) {
	return {
		type: JETPACK_MODULES_RECEIVE,
		siteId,
		modules,
	};
}

export const fetchModuleList = ( siteId ) => {
	return ( dispatch ) => {
		dispatch( {
			type: JETPACK_MODULES_REQUEST,
			siteId,
		} );

		return wp
			.undocumented()
			.getJetpackModules( siteId )
			.then( ( { data } ) => {
				const modules = mapValues( data, ( module ) => ( {
					active: module.activated,
					...omit( module, 'activated' ),
				} ) );

				dispatch( receiveJetpackModules( siteId, modules ) );
				dispatch( {
					type: JETPACK_MODULES_REQUEST_SUCCESS,
					siteId,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULES_REQUEST_FAILURE,
					siteId,
					error: error.message,
				} );
			} );
	};
};
