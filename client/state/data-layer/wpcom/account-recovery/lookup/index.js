/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

import {
	ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST,
	ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
	ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
} from 'state/action-types';

export const requestResetOptions = ( { dispatch }, { userData } ) => (
	wpcom.req.get( {
		body: userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} ).then( options => dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
		options,
	} ) )
	.catch( error => dispatch( {
		type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
		error,
	} ) )
);

export default {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [ requestResetOptions ],
};
