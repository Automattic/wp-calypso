/** @format */
/**
 * Internal dependencies
 */
import { ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST } from 'state/action-types';
import {
	validateRequestSuccess,
	validateRequestError,
	setValidationKey,
} from 'state/account-recovery/reset/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: '/account-recovery/validate',
			body: {
				...action.userData,
				method: action.method,
				key: action.key,
			},
		},
		action
	);

export const onSuccess = ( { key } ) => [ validateRequestSuccess(), setValidationKey( key ) ];

export const onError = ( action, response ) => validateRequestError( response );

registerHandlers( 'state/data-layer/wpcom/account-recovery/validate/index.js', {
	[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: [
		dispatchRequestEx( { fetch, onSuccess, onError } ),
	],
} );

export default {};
