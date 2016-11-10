/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { errorNotice } from 'state/notices/actions';
import { dispatchError } from '../utils';

import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
} from 'state/action-types';

const getUpdateErrorNotice = ( target ) => {
	switch ( target ) {
		case 'phone':
			return errorNotice( translate( 'An error occurred while updating your account recovery phone number.' ) );
		case 'email':
			return errorNotice( translate( 'An error occurred while updating your account recovery email.' ) );
		default:
			return errorNotice( translate( 'An error occurred while updating your account recovery options.' ) );
	}
};

const getDeleteErrorNotice = ( target ) => {
	switch ( target ) {
		case 'phone':
			return errorNotice( translate( 'An error occurred while deleting your account recovery phone number.' ) );
		case 'email':
			return errorNotice( translate( 'An error occurred while deleting your account recovery email.' ) );
		default:
			return errorNotice( translate( 'An error occurred while deleting your account recovery options.' ) );
	}
};

const handlers = {
	[ ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED ]: dispatchError(
		translate( 'An error occurred while fetching for your account recovery settings.' )
	),
	[ ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED ]: ( dispatch, { target } ) => dispatch( getUpdateErrorNotice( target ) ),
	[ ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED ]: ( dispatch, { target } ) => dispatch( getDeleteErrorNotice( target ) ),
};

export default handlers;
