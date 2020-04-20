/**
 * External dependencies
 */
import { replace } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
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
} from 'state/action-types';

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
		.catch( ( error ) => dispatch( accountRecoverySettingsFetchFailed( error ) ) );
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
		.then( () => dispatch( updateAccountRecoveryPhoneSuccess( newPhone ) ) )
		.catch( ( error ) => dispatch( updateAccountRecoveryPhoneFailed( error ) ) );
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
		.then( () => dispatch( deleteAccountRecoveryPhoneSuccess() ) )
		.catch( ( error ) => dispatch( deleteAccountRecoveryPhoneFailed( error ) ) );
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
		.then( () => dispatch( updateAccountRecoveryEmailSuccess( newEmail ) ) )
		.catch( ( error ) => dispatch( updateAccountRecoveryEmailFailed( error ) ) );
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
		.then( () => dispatch( deleteAccountRecoveryEmailSuccess() ) )
		.catch( ( error ) => dispatch( deleteAccountRecoveryEmailFailed( error ) ) );
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
		.then( () => dispatch( resendAccountRecoveryEmailValidationSuccess() ) )
		.catch( ( error ) => dispatch( resendAccountRecoveryEmailValidationFailed( error ) ) );
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
		.then( () => dispatch( resendAccountRecoveryPhoneValidationSuccess() ) )
		.catch( ( error ) => dispatch( resendAccountRecoveryPhoneValidationFailed( error ) ) );
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
		.validateAccountRecoveryPhone( replace( code, /\s/g, '' ) )
		.then( () => dispatch( validateAccountRecoveryPhoneSuccess() ) )
		.catch( ( error ) => dispatch( validateAccountRecoveryPhoneFailed( error ) ) );
};
