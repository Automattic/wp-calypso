/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { ACCOUNT_RECOVERY_RESET_REQUEST } from 'state/action-types';
import {
	requestResetSuccess,
	requestResetError,
	setResetMethod,
} from 'state/account-recovery/reset/actions';

export const handleRequestReset = ( { dispatch }, action, next ) => {
	const {
		userData,
		method,
	} = action;

	wpcom.req.post( {
		body: {
			...userData,
			method,
		},
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/request-reset',
	} ).then( () => {
		dispatch( requestResetSuccess() );
		dispatch( setResetMethod( method ) );
	} )
	.catch( ( error ) => dispatch( requestResetError( error ) ) );

	return next( action );
};

export default {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: [ handleRequestReset ],
};
