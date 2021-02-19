/**
 * External dependencies
 */
import { omit, mapValues } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
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
} from 'calypso/state/action-types';
import wp from 'calypso/lib/wp';

import 'calypso/state/jetpack/init';

const noticeSettings = {
	duration: 10000,
	id: 'site-settings-save',
};
const showNotice = ( type, moduleSlug, silent ) => {
	return ( dispatch ) => {
		if ( silent ) {
			return;
		}

		switch ( type ) {
			case JETPACK_MODULE_ACTIVATE_SUCCESS:
			case JETPACK_MODULE_DEACTIVATE_SUCCESS:
				return dispatch(
					successNotice( translate( 'Settings saved successfully!' ), noticeSettings )
				);
			case JETPACK_MODULE_ACTIVATE_FAILURE:
			case JETPACK_MODULE_DEACTIVATE_FAILURE:
				return dispatch(
					errorNotice(
						translate( 'There was a problem saving your changes. Please try again.' ),
						noticeSettings
					)
				);
		}
	};
};

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
				dispatch( showNotice( JETPACK_MODULE_ACTIVATE_SUCCESS, moduleSlug, silent ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULE_ACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					silent,
					error: error.message,
				} );
				dispatch( showNotice( JETPACK_MODULE_ACTIVATE_FAILURE, moduleSlug, silent ) );
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
				dispatch( showNotice( JETPACK_MODULE_DEACTIVATE_SUCCESS, moduleSlug, silent ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: JETPACK_MODULE_DEACTIVATE_FAILURE,
					siteId,
					moduleSlug,
					silent,
					error: error.message,
				} );
				dispatch( showNotice( JETPACK_MODULE_DEACTIVATE_FAILURE, moduleSlug, silent ) );
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
