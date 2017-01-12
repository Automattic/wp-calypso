/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE_FAILURE as ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS as ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_FAILURE as DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS as DEACTIVATE_SUCCESS,
} from 'state/action-types';

export const MODULE_NOTICES = {
	'infinite-scroll': {
		[ ACTIVATE_SUCCESS ]: translate( 'Infinite scroll has been enabled for your theme.' ),
		[ DEACTIVATE_SUCCESS ]: translate( 'Infinite scroll has been disabled for your theme.' ),
		[ ACTIVATE_FAILURE ]: translate( 'Infinite scroll could not be enabled for your theme.' ),
		[ DEACTIVATE_FAILURE ]: translate( 'Infinite scroll could not be disabled for your theme.' ),
	},
};
