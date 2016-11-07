/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE,
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS
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
