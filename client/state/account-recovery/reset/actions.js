/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
} from 'state/action-types';

const fromApi = ( data ) => ( {
	primaryEmail: data.primary_email,
	primarySms: data.primary_sms,
	secondaryEmail: data.secondary_email,
	secondarySms: data.secondary_sms,
} );

export const fetchResetOptions = ( userData ) => ( dispatch ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	} );

	return wpcom.req.get( {
		body: userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} ).then( data => dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
		options: fromApi( data ),
	} ) )
	.catch( error => dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
		error,
	} ) );
};

export const fetchResetOptionsByLogin = ( user ) => fetchResetOptions( { user } );

export const fetchResetOptionsByNameAndUrl = ( firstname, lastname, url ) => fetchResetOptions( { firstname, lastname, url } );

export const fetchResetOptionsSuccess = ( options ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	options,
} );

export const fetchResetOptionsError = ( error ) => ( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	error,
} );
