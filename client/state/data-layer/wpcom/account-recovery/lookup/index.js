/** @format */
/**
 * External dependencies
 */
import { isString, tap } from 'lodash';

/**
 * Internal dependencies
 */
import { fetchResetOptionsSuccess, fetchResetOptionsError, updatePasswordResetUserData } from 'state/account-recovery/reset/actions';
import { ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const fromApi = data => [
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
];

export const validate = ( { primary_email, primary_sms, secondary_email, secondary_sms } ) => {
	if ( ! [ primary_email, primary_sms, secondary_email, secondary_sms ].every( isString ) ) {
		throw Error( 'Unexpected response format from /account-recovery/lookup' );
	}
};

export const requestResetOptions = ( { dispatch }, action ) => {
	const { userData } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: '/account-recovery/lookup',
				apiNamespace: 'wpcom/v2',
				query: userData,
				retryPolicy: noRetry(),
			},
			action
		)
	);
};

export const requestResetOptionsError = ( { dispatch }, action, error ) => {
	dispatch( fetchResetOptionsError( error ) );
};

export const requestResetOptionsSuccess = ( store, action, data ) => {
	const { dispatch } = store;
	const { userData } = action;

	try {
		dispatch( fetchResetOptionsSuccess( fromApi( tap( data, validate ) ) ) );
		dispatch( updatePasswordResetUserData( userData ) );
	} catch ( error ) {
		requestResetOptionsError( store, action, error );
	}
};

export default {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [
		dispatchRequest( requestResetOptions, requestResetOptionsSuccess, requestResetOptionsError ),
	],
};
