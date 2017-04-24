/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST } from 'state/action-types';
import {
	validateRequestSuccess,
	validateRequestError,
} from 'state/account-recovery/reset/actions';

export const handleValidateRequest = ( { dispatch }, action, next ) => {
	const { userData, method, key } = action;
	wpcom.req.post( {
		body: {
			...userData,
			method,
			key,
		},
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/validate',
	} ).then( () => dispatch( validateRequestSuccess() ) )
	.catch( ( error ) => dispatch( validateRequestError( error ) ) );

	return next( action );
};

export default {
	[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: [ handleValidateRequest ],
};
