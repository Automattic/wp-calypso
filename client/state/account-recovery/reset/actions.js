/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
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

const updatePasswordResetUserData = ( userData ) => ( {
	type: ACCOUNT_RECOVERY_RESET_UPDATE_USER_DATA,
	...userData,
} );

export const updatePasswordResetUserLogin = ( user ) => updatePasswordResetUserData( { user } );

export const updatePasswordResetUserFirstName = ( firstName ) => updatePasswordResetUserData( { firstName } );

export const updatePasswordResetUserLastName = ( lastName ) => updatePasswordResetUserData( { lastName } );

export const updatePasswordResetUserSiteUrl = ( url ) => updatePasswordResetUserData( { url } );
