/**
 * Internal dependencies
 */
import {
	EMAIL_ACCOUNTS_REQUEST,
	EMAIL_ACCOUNTS_REQUEST_SUCCESS,
	EMAIL_ACCOUNTS_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/email-accounts/init';
import 'state/data-layer/wpcom/email-accounts';

export const getEmailAccounts = ( siteId, useBuffer = true ) => {
	return {
		type: EMAIL_ACCOUNTS_REQUEST,
		siteId,
		useBuffer,
	};
};

export const receiveGetEmailAccountsSuccess = ( siteId, response ) => {
	return {
		type: EMAIL_ACCOUNTS_REQUEST_SUCCESS,
		siteId,
		response,
	};
};

export const receiveGetEmailAccountsFailure = ( siteId, error ) => {
	return {
		type: EMAIL_ACCOUNTS_REQUEST_FAILURE,
		siteId,
		error,
	};
};
