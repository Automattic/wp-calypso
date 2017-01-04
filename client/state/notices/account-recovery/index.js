/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import {
	successNotice,
	errorNotice,
} from 'state/notices/actions';

import {
	getAccountRecoveryPhone,
	getAccountRecoveryEmail,
} from 'state/account-recovery/settings/selectors';

import { dispatchError } from '../utils';

const getUpdateSuccessMessage = ( target, getState ) => {
	switch ( target ) {
		case 'phone':
			const oldPhone = getAccountRecoveryPhone( getState() );

			if ( null == oldPhone ) {
				return translate( 'Successfully added new recovery SMS number.' );
			}

			return translate( 'Successfully updated recovery SMS number.' );

		case 'email':
			const oldEmail = getAccountRecoveryEmail( getState() );

			if ( ! oldEmail ) {
				return translate( 'Successfully added new recovery email address.' );
			}

			return translate( 'Successfully updated recovery email address.' );

		default:
			return translate( 'Successfully updated the recovery option.', {
				comment: 'Recovery option here is a generic term for all the ways for account recovery.' +
					'e.g. emails and sms numbers are two ways we are providing at the moment.'
			} );
	}
};

const getUpdateErrorMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'An error occurred while updating your account recovery phone number.' );
		case 'email':
			return translate( 'An error occurred while updating your account recovery email.' );
		default:
			return translate( 'An error occurred while updating your account recovery options.', {
				comment: 'Recovery option here is a generic term for all the ways for account recovery.' +
					'e.g. emails and sms numbers are two ways we are providing at the moment.'
			} );
	}
};

const getDeleteSuccessMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'Successfully removed recovery SMS number.' );
		case 'email':
			return translate( 'Successfully removed recovery email address.' );
		default:
			return translate( 'Successfully removed the recovery option.', {
				comment: 'Recovery option here is a generic term for all the ways for account recovery.' +
					'e.g. emails and sms numbers are two ways we are providing at the moment.'
			} );
	}
};

const getDeleteErrorMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'An error occurred while deleting your account recovery phone number.' );
		case 'email':
			return translate( 'An error occurred while deleting your account recovery email.' );
		default:
			return translate( 'An error occurred while deleting your account recovery options.', {
				comment: 'Recovery option here is a generic term for all the ways for account recovery.' +
					'e.g. emails and sms numbers are two ways we are providing at the moment.'
			} );
	}
};

export const onAccountRecoverySettingsFetchFailed = dispatchError(
	translate( 'An error occurred while fetching your account recovery settings.' )
);

export const onAccountRecoverySettingsUpdateSuccess = ( dispatch, { target }, getState ) =>
	dispatch( successNotice( getUpdateSuccessMessage( target, getState ) ) );

export const onAccountRecoverySettingsUpdateFailed = ( dispatch, { target } ) =>
	dispatch( errorNotice( getUpdateErrorMessage( target ) ) );

export const onAccountRecoverySettingsDeleteSuccess = ( dispatch, { target } ) =>
	dispatch( successNotice( getDeleteSuccessMessage( target ) ) );

export const onAccountRecoverySettingsDeleteFailed = ( dispatch, { target } ) =>
	dispatch( errorNotice( getDeleteErrorMessage( target ) ) );
