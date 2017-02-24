/**
 * External dependencies
 */
import { isString } from 'lodash';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

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
].every( isString );

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

export const onSuccess = ( { dispatch }, action, next, data ) => {
	if ( validate( data ) ) {
		dispatch( {
			type: ACCOUNT_RECOVERY_RESET_OPTIONS_RECEIVE,
			items: fromApi( data ),
		} );
	} else {
		throw Error( 'Unexpected response format' );
	}
};

export const onError = ( { dispatch }, action, next, error ) => dispatch( {
	type: ACCOUNT_RECOVERY_RESET_OPTIONS_ERROR,
	error: error,
} );

export const requestResetOptions = ( { dispatch }, action ) => dispatch( http( {
	method: 'GET',
	path: '/account-recovery/lookup',
	apiNamespace: 'wpcom/v2',
	body: action.userData,
}, action ) );

export default {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [ dispatchRequest( requestResetOptions, onSuccess, onError ) ],
};
