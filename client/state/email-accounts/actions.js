/**
 * Internal dependencies
 */
import {
	EMAIL_ACCOUNTS_REQUEST,
	EMAIL_ACCOUNTS_REQUEST_SUCCESS,
	EMAIL_ACCOUNTS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/email-accounts/init';
import 'calypso/state/data-layer/wpcom/email-accounts';

export const getEmailAccounts = ( siteId ) => {
	return {
		type: EMAIL_ACCOUNTS_REQUEST,
		siteId,
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
