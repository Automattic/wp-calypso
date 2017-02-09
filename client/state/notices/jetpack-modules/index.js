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
} from 'state/action-types';
import { MODULE_NOTICES } from './constants';
import { successNotice, errorNotice } from 'state/notices/actions';

export const onJetpackModuleActivationActionMessage = ( dispatch, { type, moduleSlug, silent } ) => {
	if ( silent ) {
		return;
	}

	const noticeSettings = { duration: 10000 };
	let message = MODULE_NOTICES[ moduleSlug ] && MODULE_NOTICES[ moduleSlug ][ type ];
	let messageType;

	switch ( type ) {
		case JETPACK_MODULE_ACTIVATE_SUCCESS:
			message = message || translate( 'Turned on successfully.' );
			messageType = 'success';
			break;
		case JETPACK_MODULE_DEACTIVATE_SUCCESS:
			message = message || translate( 'Turned off successfully.' );
			messageType = 'success';
			break;
		case JETPACK_MODULE_ACTIVATE_FAILURE:
			message = message || translate( 'An error occurred during activation.' );
			messageType = 'error';
			break;
		case JETPACK_MODULE_DEACTIVATE_FAILURE:
			message = message || translate( 'An error occurred during deactivation.' );
			messageType = 'error';
			break;
	}

	if ( ! message ) {
		return;
	}

	if ( messageType === 'success' ) {
		dispatch( successNotice( message, noticeSettings ) );
	} else if ( messageType === 'error' ) {
		dispatch( errorNotice( message, noticeSettings ) );
	}
};
