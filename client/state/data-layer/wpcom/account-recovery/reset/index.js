/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST } from 'state/action-types';
import {
	requestResetPasswordSuccess,
	requestResetPasswordError,
} from 'state/account-recovery/reset/actions';

// userData can be either { user } or { firstname, lastname, url }
export const handleResetPasswordRequest = ( { dispatch }, { userData, method, key, password } ) => (
	wpcom.req.post( {
		body: {
			...userData,
			method,
			key,
			password,
		},
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/reset'
	} ).then( () => dispatch( requestResetPasswordSuccess() ) )
	.catch( ( error ) => dispatch( requestResetPasswordError( error ) ) )
);

export default {
	[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: [ handleResetPasswordRequest ],
};
