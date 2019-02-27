/**
 * Internal dependencies
 */
import { EMAIL_FORWARDING_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveRequestEmailForwardsSuccess,
	receiveRequestEmailForwardsFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestEmailForwards = action => {
	return http(
		{
			method: 'GET',
			path: `/domains/${ encodeURIComponent( action.domainName ) }/email`,
		},
		action
	);
};

export const requestEmailForwardsSuccess = ( action, response ) => {
	if ( response.forwards ) {
		return receiveRequestEmailForwardsSuccess( action.domainName, response.forwards );
	}
	return receiveRequestEmailForwardsFailure( action.domainName, true );
};

export const requestEmailForwardsError = ( action, error ) => {
	return receiveRequestEmailForwardsFailure( action.domainName, error );
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/get/index.js', {
	[ EMAIL_FORWARDING_REQUEST ]: [
		dispatchRequest( {
			fetch: requestEmailForwards,
			onSuccess: requestEmailForwardsSuccess,
			onError: requestEmailForwardsError,
		} ),
	],
} );
