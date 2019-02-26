/** @format */

/**
 * Internal dependencies
 */
import {
	EMAIL_FORWARDING_REQUEST,
	EMAIL_FORWARDING_REQUEST_SUCCESS,
	EMAIL_FORWARDING_REQUEST_FAILURE,
} from 'state/action-types';

import 'state/data-layer/wpcom/email-forwarding';

export function requestEmailForwarding( domainName ) {
	return {
		type: EMAIL_FORWARDING_REQUEST,
		domainName,
	};
}

export function receiveEmailForwardingRequestSuccess( domainName, data ) {
	return {
		type: EMAIL_FORWARDING_REQUEST_SUCCESS,
		domainName,
		data,
	};
}

export function receiveEmailForwardingRequestFailure( domainName, error ) {
	return {
		type: EMAIL_FORWARDING_REQUEST_FAILURE,
		domainName,
		error,
	};
}
