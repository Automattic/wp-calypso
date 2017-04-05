/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
	ACCOUNT_RECOVERY_RESET_PICK_METHOD,
	ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
} from 'state/action-types';

export const fetchResetOptionsSuccess = ( items ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	items,
} );

export const fetchResetOptionsError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	error,
} );

export const fetchResetOptions = ( userData ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	userData,
} );

export const fetchResetOptionsByLogin = ( user ) => fetchResetOptions( { user } );

export const fetchResetOptionsByNameAndUrl = ( firstname, lastname, url ) => fetchResetOptions( { firstname, lastname, url } );

export const updatePasswordResetUserData = ( userData ) => ( {
	type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	userData,
} );

export const requestResetSuccess = () => ( {
	type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
} );

export const requestResetError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	error,
} );

export const requestReset = ( request ) => ( {
	type: ACCOUNT_RECOVERY_RESET_REQUEST,
	request,
} );

export const validateRequest = ( userData, method, key ) => ( {
	type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	userData,
	method,
	key,
} );

export const validateRequestSuccess = () => ( {
	type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_SUCCESS,
} );

export const validateRequestError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST_ERROR,
	error,
} );

export const requestResetPasswordSuccess = () => ( {
	type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
} );

export const requestResetPasswordError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
	error,
} );

export const requestResetPassword = ( userData, method, key, password ) => ( {
	type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	userData,
	method,
	key,
	password,
} );

export const pickResetMethod = ( method ) => ( {
	type: ACCOUNT_RECOVERY_RESET_PICK_METHOD,
	method,
} );

export const setValidationKey = ( key ) => ( {
	type: ACCOUNT_RECOVERY_RESET_SET_VALIDATION_KEY,
	key,
} );
