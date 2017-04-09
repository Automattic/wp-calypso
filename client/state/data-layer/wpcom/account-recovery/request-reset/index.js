/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { ACCOUNT_RECOVERY_RESET_REQUEST } from 'state/action-types';
import {
	requestResetSuccess,
	requestResetError,
} from 'state/account-recovery/reset/actions';

export const handleRequestReset = ( { dispatch }, { request } ) => (
	wpcom.req.post( {
		body: request,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/request-reset',
	} ).then( () => dispatch( requestResetSuccess() ) )
	.catch( ( error ) => dispatch( requestResetError( error ) ) )
);

export default {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: [ handleRequestReset ],
};
