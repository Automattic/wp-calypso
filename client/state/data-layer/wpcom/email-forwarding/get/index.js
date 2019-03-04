/**
 * Internal dependencies
 */
import { EMAIL_FORWARDING_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetEmailForwardsSuccess,
	receiveGetEmailForwardsFailure,
} from 'state/email-forwarding/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const getEmailForwards = action => {
	return http(
		{
			method: 'GET',
			path: `/domains/${ encodeURIComponent( action.domainName ) }/email`,
		},
		action
	);
};

export const getEmailForwardsFailure = ( action, error ) => {
	return receiveGetEmailForwardsFailure( action.domainName, error );
};

export const getEmailForwardsSuccess = ( action, response ) => {
	if ( response && response.forwards ) {
		return receiveGetEmailForwardsSuccess( action.domainName, response.forwards );
	}
	return getEmailForwardsFailure( action, true );
};

registerHandlers( 'state/data-layer/wpcom/email-forwarding/get/index.js', {
	[ EMAIL_FORWARDING_REQUEST ]: [
		dispatchRequest( {
			fetch: getEmailForwards,
			onSuccess: getEmailForwardsSuccess,
			onError: getEmailForwardsFailure,
		} ),
	],
} );

export default {};
