/**
 * Internal dependencies
 */
import {
	TITAN_USERS_REQUEST,
	TITAN_USERS_REQUEST_SUCCESS,
	TITAN_USERS_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/data-layer/wpcom/titan-users';

export const getTitanUsers = ( siteId ) => {
	return {
		type: TITAN_USERS_REQUEST,
		siteId,
	};
};

export const receiveGetTitanUsersSuccess = ( siteId, response ) => {
	return {
		type: TITAN_USERS_REQUEST_SUCCESS,
		siteId,
		response,
	};
};

export const receiveGetTitanUsersFailure = ( siteId, error ) => {
	return {
		type: TITAN_USERS_REQUEST_FAILURE,
		siteId,
		error,
	};
};
