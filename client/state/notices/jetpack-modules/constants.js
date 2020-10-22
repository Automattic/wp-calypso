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
} from 'calypso/state/action-types';

export const MODULE_NOTICES = {
	'infinite-scroll': {
		[ ACTIVATE_SUCCESS ]: translate( 'Infinite scroll is now on.' ),
		[ DEACTIVATE_SUCCESS ]: translate( 'Infinite scroll is now off.' ),
		[ ACTIVATE_FAILURE ]: translate( 'Infinite scroll could not be switched on.' ),
		[ DEACTIVATE_FAILURE ]: translate( 'Infinite scroll could not be switched off.' ),
	},
};
