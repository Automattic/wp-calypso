/** @format */

/**
 * External dependencies
 */
import debugFactory from 'debug';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice, successNotice } from 'state/notices/actions';

const debug = debugFactory( 'calypso:state:data-layer:wpcom:users:social:new' );

export function requestNewSocialUser( action ) {
	return http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/users/social/new',
			body: {
				service: action.service,
				access_token: action.accessToken,
				id_token: action.idToken,
				signup_flow_name: action.flowName,
			},
		},
		action
	);
}

export function userCreated( action, data ) {
	debug( 'User sucessfully created: %o', data );
	return successNotice( 'Yay!' );
}

export function creationError( action, error ) {
	debug( 'Error creating user. action %o error %o', action, error );
	return errorNotice( translate( 'There was a problem creating your account, please try again.' ) );
}

export default {
	// @TODO action type
	ACCOUNT_SOCIAL_CREATE: [
		dispatchRequestEx( {
			fetch: requestNewSocialUser,
			onSuccess: userCreated,
			onError: creationError,
		} ),
	],
};
