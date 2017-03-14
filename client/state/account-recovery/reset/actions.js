/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
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
} from 'state/action-types';

export const fetchResetOptionsSuccess = ( items ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	items,
} );

export const fetchResetOptionsError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	error,
} );

const fromApi = ( data ) => ( [
	{
		email: data.primary_email,
		sms: data.primary_sms,
	},
	{
		email: data.secondary_email,
		sms: data.secondary_sms,
	},
] );

export const fetchResetOptions = ( userData ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	} );

	return wpcom.req.get( {
		body: userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} ).then( data => dispatch( fetchResetOptionsSuccess( fromApi( data ) ) ) )
	.catch( error => dispatch( fetchResetOptionsError( error ) ) );
};

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

export const validateRequest = ( request ) => ( {
	type: ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST,
	request,
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
