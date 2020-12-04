/**
 * Internal dependencies
 */
import {
	GSUITE_USERS_REQUEST,
	GSUITE_USERS_REQUEST_SUCCESS,
	GSUITE_USERS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/gsuite-users';
import 'calypso/state/gsuite-users/init';

export const getGSuiteUsers = ( siteId ) => {
	return {
		type: GSUITE_USERS_REQUEST,
		siteId,
	};
};

export const receiveGetGSuiteUsersSuccess = ( siteId, response ) => {
	return {
		type: GSUITE_USERS_REQUEST_SUCCESS,
		siteId,
		response,
	};
};

export const receiveGetGSuiteUsersFailure = ( siteId, error ) => {
	return {
		type: GSUITE_USERS_REQUEST_FAILURE,
		siteId,
		error,
	};
};
