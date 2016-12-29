/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { successNotice, errorNotice } from 'state/notices/actions';
import { dispatchError } from '../utils';

const getUpdateSuccessMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'Successfully updated recovery SMS number.' );
		case 'email':
			return translate( 'Successfully updated recovery email address.' );
		default:
			return translate( 'Successfully updated the recovery option.' );
	}
};

const getUpdateErrorMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'An error occurred while updating your account recovery phone number.' );
		case 'email':
			return translate( 'An error occurred while updating your account recovery email.' );
		default:
			return translate( 'An error occurred while updating your account recovery options.' );
	}
};

const getDeleteSuccessMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'Successfully removed recovery SMS number.' );
		case 'email':
			return translate( 'Successfully removed recovery email address.' );
		default:
			return translate( 'Successfully removed the recovery option.' );
	}
};

const getDeleteErrorMessage = ( target ) => {
	switch ( target ) {
		case 'phone':
			return translate( 'An error occurred while deleting your account recovery phone number.' );
		case 'email':
			return translate( 'An error occurred while deleting your account recovery email.' );
		default:
			return translate( 'An error occurred while deleting your account recovery options.' );
	}
};

export const onAccountRecoverySettingsFetchFailed = dispatchError(
	translate( 'An error occurred while fetching your account recovery settings.' )
);

export const onAccountRecoverySettingsUpdateSuccess = ( dispatch, { target } ) =>
	dispatch( successNotice( getUpdateSuccessMessage( target ) ) );

export const onAccountRecoverySettingsUpdateFailed = ( dispatch, { target } ) =>
	dispatch( errorNotice( getUpdateErrorMessage( target ) ) );

export const onAccountRecoverySettingsDeleteSuccess = ( dispatch, { target } ) =>
	dispatch( successNotice( getDeleteSuccessMessage( target ) ) );

export const onAccountRecoverySettingsDeleteFailed = ( dispatch, { target } ) =>
	dispatch( errorNotice( getDeleteErrorMessage( target ) ) );
