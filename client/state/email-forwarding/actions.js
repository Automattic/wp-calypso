import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/email-forwarding/get';
import 'calypso/state/email-forwarding/init';

export const getEmailForwards = ( domainName ) => {
	return {
		type: EMAIL_FORWARDING_REQUEST,
		domainName,
	};
};

export const receiveGetEmailForwardsSuccess = ( domainName, response ) => {
	return {
		type: EMAIL_FORWARDING_REQUEST_SUCCESS,
		domainName,
		response,
	};
};

export const receiveGetEmailForwardsFailure = ( domainName, error ) => {
	return {
		type: EMAIL_FORWARDING_REQUEST_FAILURE,
		domainName,
		error,
	};
};
