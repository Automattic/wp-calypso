/** @format */

/**
 * Internal dependencies
 */
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
	EMAIL_FORWARDING_CREATE_REQUEST,
	EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_CREATE_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/data-layer/wpcom/email-forwarding';

export const requestEmailForwarding = domainName => {
	return {
		type: EMAIL_FORWARDING_REQUEST,
		domainName,
	};
};

export const receiveEmailForwardingRequestSuccess = ( domainName, data ) => {
	return {
		type: EMAIL_FORWARDING_REQUEST_SUCCESS,
		domainName,
		data,
	};
};

export const receiveEmailForwardingRequestFailure = ( domainName, error ) => {
	return {
		type: EMAIL_FORWARDING_REQUEST_FAILURE,
		domainName,
		error,
	};
};

export const createEmailForwarding = ( domainName, mailbox, destination ) => {
	return {
		type: EMAIL_FORWARDING_CREATE_REQUEST,
		domainName,
		mailbox,
		destination,
	};
};

export const receiveCreateEmailForwardingSuccess = ( domainName, mailbox, verified ) => {
	return {
		type: EMAIL_FORWARDING_CREATE_REQUEST_SUCCESS,
		domainName,
		mailbox,
		verified,
	};
};

export const receiveCreateEmailForwardingFailure = ( domainName, mailbox, destination, error ) => {
	return {
		type: EMAIL_FORWARDING_CREATE_REQUEST_FAILURE,
		domainName,
		mailbox,
		destination,
		error,
	};
};
