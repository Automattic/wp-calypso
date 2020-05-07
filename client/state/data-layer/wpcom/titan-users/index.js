/**
 * External Dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { TITAN_USERS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { errorNotice } from 'state/notices/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	receiveGetTitanUsersSuccess,
	receiveGetTitanUsersFailure,
} from 'state/titan-users/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const getTitanUsers = ( action ) => {
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/titan`,
		},
		action
	);
};

export const getTitanUsersFailure = ( action, error ) => {
	return [
		errorNotice( translate( 'Failed to retrieve Titan Users' ) ),
		receiveGetTitanUsersFailure( action.siteId, error ),
	];
};

export const getTitanUsersSuccess = ( action, response ) => {
	if ( response ) {
		return receiveGetTitanUsersSuccess( action.siteId, response );
	}
	return getTitanUsersFailure( action, { message: 'No response.' } );
};

registerHandlers( 'state/data-layer/wpcom/titan-users/index.js', {
	[ TITAN_USERS_REQUEST ]: [
		dispatchRequest( {
			fetch: getTitanUsers,
			onSuccess: getTitanUsersSuccess,
			onError: getTitanUsersFailure,
		} ),
	],
} );
