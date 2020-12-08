/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	JETPACK_MODULE_ACTIVATE_FAILURE,
	JETPACK_MODULE_ACTIVATE_SUCCESS,
	JETPACK_MODULE_DEACTIVATE_FAILURE,
	JETPACK_MODULE_DEACTIVATE_SUCCESS,
} from 'calypso/state/action-types';
import { MODULE_NOTICES } from './constants';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

export const onJetpackModuleActivationActionMessage = ( { type, moduleSlug, silent } ) => {
	if ( silent ) {
		return null;
	}

	const noticeSettings = {
		duration: 10000,
		id: 'site-settings-save',
	};
	let message = MODULE_NOTICES[ moduleSlug ] && MODULE_NOTICES[ moduleSlug ][ type ];
	let messageType;

	switch ( type ) {
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			message = message || translate( 'Settings saved successfully!' );
			messageType = 'success';
			break;
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			message = message || translate( 'Settings saved successfully!' );
			messageType = 'success';
			break;
		case JETPACK_MODULE_ACTIVATE_FAILURE:
			message =
				message || translate( 'There was a problem saving your changes. Please try again.' );
			messageType = 'error';
			break;
		case JETPACK_MODULE_DEACTIVATE_FAILURE:
			message =
				message || translate( 'There was a problem saving your changes. Please try again.' );
			messageType = 'error';
			break;
	}

	if ( ! message ) {
		return null;
	}

	if ( messageType === 'success' ) {
		return successNotice( message, noticeSettings );
	} else if ( messageType === 'error' ) {
		return errorNotice( message, noticeSettings );
	}
};
