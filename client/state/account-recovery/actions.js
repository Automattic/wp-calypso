/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_FETCH,
	ACCOUNT_RECOVERY_FETCH_SUCCESS,
	ACCOUNT_RECOVERY_FETCH_FAILED,

	ACCOUNT_RECOVERY_PHONE_UPDATE,
	ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,

	ACCOUNT_RECOVERY_PHONE_DELETE,
	ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS,
	ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,

	ACCOUNT_RECOVERY_EMAIL_UPDATE,
	ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS,
	ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED,
} from 'state/action-types';

export const accountRecoveryFetchSuccess = ( accountRecoverySettings ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_SUCCESS,
		...accountRecoverySettings,
	};
};

export const accountRecoveryFetchFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_FETCH_FAILED,
		error,
	};
};

export const accountRecoveryFetch = () => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_FETCH } );

	return wpcom.undocumented().me().getAccountRecovery()
		.then( ( accountRecoverySettings ) => {
			dispatch( accountRecoveryFetchSuccess( accountRecoverySettings ) );
		} ).catch( ( { status, message } ) => {
			dispatch( accountRecoveryFetchFailed( { status, message } ) );
		} );
};

export const updateAccountRecoveryPhoneSuccess = ( phone ) => {
	return {
		type: ACCOUNT_RECOVERY_PHONE_UPDATE_SUCCESS,
		phone,
	};
};

export const updateAccountRecoveryPhoneFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_PHONE_UPDATE_FAILED,
		error,
	};
};

export const updateAccountRecoveryPhone = ( countryCode, number ) => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_PHONE_UPDATE } );

	return wpcom.undocumented().me().updateAccountRecoveryPhone( countryCode, number )
		.then( ( phone ) => {
			dispatch( updateAccountRecoveryPhoneSuccess( phone ) );
		} ).catch( ( { status, message } ) => {
			dispatch( updateAccountRecoveryPhoneFailed( { status, message } ) );
		} );
};

export const deleteAccountRecoveryPhoneSuccess = () => {
	return {
		type: ACCOUNT_RECOVERY_PHONE_DELETE_SUCCESS,
	};
};

export const deleteAccountRecoveryPhoneFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_PHONE_DELETE_FAILED,
		error,
	};
};

export const deleteAccountRecoveryPhone = () => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_PHONE_DELETE } );

	return wpcom.undocumented().me().deleteAccountRecoveryPhone()
		.then( () => {
			dispatch( deleteAccountRecoveryPhoneSuccess() );
		} ).catch( ( { status, message } ) => {
			dispatch( deleteAccountRecoveryPhoneFailed( { status, message } ) );
		} );
};

export const updateAccountRecoveryEmailSuccess = ( email ) => {
	return {
		type: ACCOUNT_RECOVERY_EMAIL_UPDATE_SUCCESS,
		email,
	};
};

export const updateAccountRecoveryEmailFailed = ( error ) => {
	return {
		type: ACCOUNT_RECOVERY_EMAIL_UPDATE_FAILED,
		error,
	};
};

export const updateAccountRecoveryEmail = ( email ) => ( dispatch ) => {
	dispatch( { type: ACCOUNT_RECOVERY_EMAIL_UPDATE } );

	return wpcom.undocumented().me().updateAccountRecoveryEmail( email )
		.then( ( newEmail ) => {
			dispatch( updateAccountRecoveryEmailSuccess( newEmail ) );
		} ).catch( ( error ) => {
			dispatch( updateAccountRecoveryEmailFailed( error ) );
		} );
};
