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
import { errorNotice } from 'state/notices/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

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

export const userCreated = dispatch => ( action, data ) => {
	debug( 'User sucessfully created: %o', data );
	if ( action.continuationAction && typeof action.continuationAction.type === 'string' ) {
		dispatch( {
			...action.continuationAction,
			userData: data,
		} );
	}
};

export function creationError( action, error ) {
	debug( 'Error creating user: action %o error %o', action, error );
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
