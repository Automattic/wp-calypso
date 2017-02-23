/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
} from 'state/action-types';

const validate = ( { primary_email, primary_sms, secondary_email, secondary_sms } ) => [
	primary_email,
	primary_sms,
	secondary_email,
	secondary_sms,
].every( String );

export const fromApi = data => (
	validate( data ) ? [
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
	] : [
		{
			email: '',
			sms: '',
			name: 'primary',
		},
		{
			email: '',
			sms: '',
			name: 'secondary',
		},
	] );

export const requestResetOptions = ( { dispatch }, { userData } ) => (
	wpcom.req.get( {
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
	} ) )
);

export default {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [ requestResetOptions ],
};
