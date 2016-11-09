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
} from 'state/action-types';

const TARGET_PHONE = 'phone';
const TARGET_EMAIL = 'email';

export const accountRecoveryFetchSuccess = ( accountRecoverySettings ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_FETCH_SUCCESS,
		...accountRecoverySettings,
	};
};

export const accountRecoveryFetchFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_FETCH_FAILED,
		error,
	};
};

export const accountRecoveryFetch = () => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_SETTINGS_FETCH } );

	return wpcom.undocumented().me().getAccountRecovery()
		.then( ( accountRecoverySettings ) => {
			dispatch( accountRecoveryFetchSuccess( accountRecoverySettings ) );
		} ).catch( ( { status, message } ) => {
			dispatch( accountRecoveryFetchFailed( { status, message } ) );
		} );
};

export const updateAccountRecoveryPhoneSuccess = ( phone ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
		target: TARGET_PHONE,
		data: phone,
	};
};

export const updateAccountRecoveryPhoneFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
		target: TARGET_PHONE,
		error,
	};
};

export const updateAccountRecoveryPhone = ( countryCode, number ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
		target: TARGET_PHONE,
	} );

	return wpcom.undocumented().me().updateAccountRecoveryPhone( countryCode, number )
		.then( ( phone ) =>
			dispatch( updateAccountRecoveryPhoneSuccess( phone ) )
		).catch( ( { status, message } ) =>
			dispatch( updateAccountRecoveryPhoneFailed( { status, message } ) )
		);
};

export const deleteAccountRecoveryPhoneSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
		target: TARGET_PHONE,
	};
};

export const deleteAccountRecoveryPhoneFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
		target: TARGET_PHONE,
		error,
	};
};

export const deleteAccountRecoveryPhone = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
		target: TARGET_PHONE,
	} );

	return wpcom.undocumented().me().deleteAccountRecoveryPhone()
		.then( () =>
			dispatch( deleteAccountRecoveryPhoneSuccess() )
		).catch( ( { status, message } ) =>
			dispatch( deleteAccountRecoveryPhoneFailed( { status, message } ) )
		);
};

export const updateAccountRecoveryEmailSuccess = ( email ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_SUCCESS,
		target: TARGET_EMAIL,
		data: email,
	};
};

export const updateAccountRecoveryEmailFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE_FAILED,
		target: TARGET_EMAIL,
		error,
	};
};

export const updateAccountRecoveryEmail = ( newEmail ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_UPDATE,
		target: TARGET_EMAIL,
	} );

	return wpcom.undocumented().me().updateAccountRecoveryEmail( newEmail )
		.then( ( { email } ) =>
			dispatch( updateAccountRecoveryEmailSuccess( email ) )
		).catch( ( { status, message } ) =>
			dispatch( updateAccountRecoveryEmailFailed( { status, message } ) )
		);
};

export const deleteAccountRecoveryEmailSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE_SUCCESS,
		target: TARGET_EMAIL,
	};
};

export const deleteAccountRecoveryEmailFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE_FAILED,
		target: TARGET_EMAIL,
		error,
	};
};

export const deleteAccountRecoveryEmail = () => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_SETTINGS_DELETE,
		target: TARGET_EMAIL,
	} );

	return wpcom.undocumented().me().deleteAccountRecoveryEmail()
		.then( () =>
			dispatch( deleteAccountRecoveryEmailSuccess() )
		).catch( ( { status, message } ) =>
			dispatch( deleteAccountRecoveryEmailFailed( { status, message } ) )
		);
};
