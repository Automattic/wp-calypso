/**
 * Internal dependencies
 */
import {
	GSUITE_USERS_REQUEST,
	GSUITE_USERS_REQUEST_SUCCESS,
	GSUITE_USERS_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/data-layer/wpcom/gsuite-users';

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
