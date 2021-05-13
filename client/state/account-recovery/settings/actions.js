/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	ACCOUNT_RECOVERY_SETTINGS_FETCH,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_DELETE,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
} from 'calypso/state/action-types';
import {
	onAccountRecoveryPhoneValidationFailed,
	onAccountRecoveryPhoneValidationSuccess,
	onAccountRecoverySettingsDeleteFailed,
	onAccountRecoverySettingsDeleteSuccess,
	onAccountRecoverySettingsFetchFailed,
	onAccountRecoverySettingsUpdateFailed,
	onAccountRecoverySettingsUpdateSuccess,
	onResentAccountRecoveryEmailValidationFailed,
	onResentAccountRecoveryEmailValidationSuccess,
} from 'calypso/state/account-recovery/settings/notices';

import 'calypso/state/account-recovery/init';

const TARGET_PHONE = 'phone';
const TARGET_EMAIL = 'email';

export const accountRecoverySettingsFetchSuccess = ( settings ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
		settings,
	};
};

export const accountRecoverySettingsFetchFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		error,
	};
};

export const accountRecoverySettingsFetch = () => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_SETTINGS_FETCH } );

	return wpcom
		.undocumented()
		.me()
		.getAccountRecovery()
		.then( ( accountRecoverySettings ) =>
			dispatch( accountRecoverySettingsFetchSuccess( accountRecoverySettings ) )
		)
		.catch( ( error ) => {
			dispatch( accountRecoverySettingsFetchFailed( error ) );
			dispatch( onAccountRecoverySettingsFetchFailed() );
		} );
};

const updateSuccessAction = ( target, value ) => ( {
	type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
	target,
	value,
} );

const updateFailedAction = ( target, error ) => ( {
	type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
	target,
	error,
} );

const deleteSuccessAction = ( target ) => ( {
	type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
	target,
} );

const deleteFailedAction = ( target, error ) => ( {
	type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
	target,
	error,
} );

export const updateAccountRecoveryPhoneSuccess = ( phone ) =>
	updateSuccessAction( TARGET_PHONE, phone );

export const updateAccountRecoveryPhoneFailed = ( error ) =>
	updateFailedAction( TARGET_PHONE, error );

export const updateAccountRecoveryPhone = ( newPhone ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
		target: TARGET_PHONE,
	} );

	return wpcom
		.undocumented()
		.me()
		.updateAccountRecoveryPhone( newPhone.countryCode, newPhone.number )
		.then( () => {
			dispatch( updateAccountRecoveryPhoneSuccess( newPhone ) );
			dispatch( onAccountRecoverySettingsUpdateSuccess( { target: TARGET_PHONE } ) );
		} )
		.catch( ( error ) => {
			dispatch( updateAccountRecoveryPhoneFailed( error ) );
			dispatch( onAccountRecoverySettingsUpdateFailed( { target: TARGET_PHONE } ) );
		} );
};

export const deleteAccountRecoveryPhoneSuccess = () => deleteSuccessAction( TARGET_PHONE );

export const deleteAccountRecoveryPhoneFailed = ( error ) =>
	deleteFailedAction( TARGET_PHONE, error );

export const deleteAccountRecoveryPhone = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
		target: TARGET_PHONE,
	} );

	return wpcom
		.undocumented()
		.me()
		.deleteAccountRecoveryPhone()
		.then( () => {
			dispatch( deleteAccountRecoveryPhoneSuccess() );
			dispatch( onAccountRecoverySettingsDeleteSuccess( { target: TARGET_PHONE } ) );
		} )
		.catch( ( error ) => {
			dispatch( deleteAccountRecoveryPhoneFailed( error ) );
			dispatch( onAccountRecoverySettingsDeleteFailed( { target: TARGET_PHONE } ) );
		} );
};

export const updateAccountRecoveryEmailSuccess = ( email ) =>
	updateSuccessAction( TARGET_EMAIL, email );

export const updateAccountRecoveryEmailFailed = ( error ) =>
	updateFailedAction( TARGET_EMAIL, error );

export const updateAccountRecoveryEmail = ( newEmail ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
		target: TARGET_EMAIL,
	} );

	return wpcom
		.undocumented()
		.me()
		.updateAccountRecoveryEmail( newEmail )
		.then( () => {
			dispatch( updateAccountRecoveryEmailSuccess( newEmail ) );
			dispatch( onAccountRecoverySettingsUpdateSuccess( { target: TARGET_EMAIL } ) );
		} )
		.catch( ( error ) => {
			dispatch( updateAccountRecoveryEmailFailed( error ) );
			dispatch( onAccountRecoverySettingsUpdateFailed( { target: TARGET_EMAIL } ) );
		} );
};

export const deleteAccountRecoveryEmailSuccess = () => deleteSuccessAction( TARGET_EMAIL );

export const deleteAccountRecoveryEmailFailed = ( error ) =>
	deleteFailedAction( TARGET_EMAIL, error );

export const deleteAccountRecoveryEmail = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
		target: TARGET_EMAIL,
	} );

	return wpcom
		.undocumented()
		.me()
		.deleteAccountRecoveryEmail()
		.then( () => {
			dispatch( deleteAccountRecoveryEmailSuccess() );
			dispatch( onAccountRecoverySettingsDeleteSuccess( { target: TARGET_EMAIL } ) );
		} )
		.catch( ( error ) => {
			dispatch( deleteAccountRecoveryEmailFailed( error ) );
			dispatch( onAccountRecoverySettingsDeleteFailed( { target: TARGET_EMAIL } ) );
		} );
};

export const resendAccountRecoveryEmailValidationSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
		target: 'email',
	};
};

export const resendAccountRecoveryEmailValidationFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
		target: 'email',
		error,
	};
};

export const resendAccountRecoveryEmailValidation = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
		target: TARGET_EMAIL,
	} );

	return wpcom
		.undocumented()
		.me()
		.newValidationAccountRecoveryEmail()
		.then( () => {
			dispatch( resendAccountRecoveryEmailValidationSuccess() );
			dispatch( onResentAccountRecoveryEmailValidationSuccess( { target: TARGET_EMAIL } ) );
		} )
		.catch( ( error ) => {
			dispatch( resendAccountRecoveryEmailValidationFailed( error ) );
			dispatch( onResentAccountRecoveryEmailValidationFailed( { target: TARGET_EMAIL } ) );
		} );
};

export const resendAccountRecoveryPhoneValidationSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_SUCCESS,
		target: 'phone',
	};
};

export const resendAccountRecoveryPhoneValidationFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION_FAILED,
		target: 'phone',
		error,
	};
};

export const resendAccountRecoveryPhoneValidation = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_RESEND_VALIDATION,
		target: TARGET_PHONE,
	} );

	return wpcom
		.undocumented()
		.me()
		.newValidationAccountRecoveryPhone()
		.then( () => {
			dispatch( resendAccountRecoveryPhoneValidationSuccess() );
			dispatch( onResentAccountRecoveryEmailValidationSuccess( { target: TARGET_PHONE } ) );
		} )
		.catch( ( error ) => {
			dispatch( resendAccountRecoveryPhoneValidationFailed( error ) );
			dispatch( onResentAccountRecoveryEmailValidationFailed( { target: TARGET_PHONE } ) );
		} );
};

export const validateAccountRecoveryPhoneSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_SUCCESS,
	};
};

export const validateAccountRecoveryPhoneFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE_FAILED,
		error,
	};
};

export const validateAccountRecoveryPhone = ( code ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_VALIDATE_PHONE,
	} );

	return wpcom
		.undocumented()
		.me()
		.validateAccountRecoveryPhone( code.replace( /\s/g, '' ) )
		.then( () => {
			dispatch( validateAccountRecoveryPhoneSuccess() );
			dispatch( onAccountRecoveryPhoneValidationSuccess() );
		} )
		.catch( ( error ) => {
			dispatch( validateAccountRecoveryPhoneFailed( error ) );
			dispatch( onAccountRecoveryPhoneValidationFailed() );
		} );
};
