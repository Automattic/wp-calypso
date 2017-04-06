/**
 * External dependencies
 */
import { isString, tap } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST } from 'state/action-types';
import {
	fetchResetOptionsSuccess,
	fetchResetOptionsError,
} from 'state/account-recovery/reset/actions';

export const fromApi = data => ( [
	{
		email: data.primary_email,
		sms: data.primary_sms,
		name: 'primary',
	},
	{
		email: data.secondary_email,
		sms: data.secondary_sms,
		name: 'secondary',
	},
] );

export const validate = ( { primary_email, primary_sms, secondary_email, secondary_sms } ) => {
	if ( ! [ primary_email, primary_sms, secondary_email, secondary_sms ].every( isString ) ) {
		throw Error( 'Unexpected response format from /account-recovery/lookup' );
	}
};

export const handleRequestResetOptions = ( { dispatch }, { userData, onSuccess } ) => (
	wpcom.req.get( {
		body: userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} ).then( data => {
		dispatch( fetchResetOptionsSuccess( fromApi( tap( data, validate ) ) ) );
		onSuccess && onSuccess();
	} )
	.catch( error => dispatch( fetchResetOptionsError( error ) ) )
);

export default {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [ handleRequestResetOptions ],
};
