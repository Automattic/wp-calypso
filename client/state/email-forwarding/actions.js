import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
	EMAIL_FORWARDING_ADD_REQUEST,
	EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
	EMAIL_FORWARDING_REMOVE_REQUEST,
	EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS,
	EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/email-forwarding/add';
import 'calypso/state/data-layer/wpcom/email-forwarding/get';
import 'calypso/state/data-layer/wpcom/email-forwarding/remove';
import 'calypso/state/data-layer/wpcom/email-forwarding/resend-email-verification';
import 'calypso/state/email-forwarding/init';

const noop = () => {};

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

export const addEmailForward = (
	domainName,
	mailbox,
	destination,
	onSuccessRedirectTarget = noop
) => {
	return {
		type: EMAIL_FORWARDING_ADD_REQUEST,
		domainName,
		mailbox,
		destination,
		onSuccessRedirectTarget,
	};
};

export const receiveAddEmailForwardSuccess = ( domainName, mailbox, verified ) => {
	return {
		type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
		domainName,
		mailbox,
		verified,
	};
};

export const receiveAddEmailForwardFailure = ( domainName, mailbox, destination, error ) => {
	return {
		type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
		domainName,
		mailbox,
		destination,
		error,
	};
};

export const removeEmailForward = ( domainName, mailbox ) => {
	return {
		type: EMAIL_FORWARDING_REMOVE_REQUEST,
		domainName,
		mailbox,
	};
};

export const receiveRemoveEmailForwardSuccess = ( domainName, mailbox ) => {
	return {
		type: EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
		domainName,
		mailbox,
	};
};

export const receiveRemoveEmailForwardFailure = ( domainName, mailbox, error ) => {
	return {
		type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
		domainName,
		mailbox,
		error,
	};
};

export const resendVerificationEmail = ( domainName, mailbox, destination ) => {
	return {
		type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST,
		domainName,
		mailbox,
		destination,
	};
};

export const receiveResendVerificationEmailSuccess = ( domainName, mailbox, destination ) => {
	return {
		type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_SUCCESS,
		domainName,
		mailbox,
		destination,
	};
};

export const receiveResendVerificationEmailFailure = (
	domainName,
	mailbox,
	destination,
	error
) => {
	return {
		type: EMAIL_FORWARDING_RESEND_VERIFICATION_REQUEST_FAILURE,
		domainName,
		mailbox,
		destination,
		error,
	};
};
