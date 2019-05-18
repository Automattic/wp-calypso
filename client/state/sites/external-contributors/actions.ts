/**
 * Internal dependencies
 */
import {
	EXTERNAL_CONTRIBUTORS_GET_REQUEST,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
	EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
	// EMAIL_FORWARDING_ADD_REQUEST,
	// EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
	// EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
	// EMAIL_FORWARDING_REMOVE_REQUEST,
	// EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
	// EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Types
 */
import { SiteId } from 'types';
import { ExternalContributor } from './types';

/**
 * Data Layer
 */
import 'state/data-layer/wpcom/sites/external-contributors';

export const getExternalContributors = ( siteId: SiteId ) => {
	return {
		type: EXTERNAL_CONTRIBUTORS_GET_REQUEST,
		siteId,
	};
};

export const receiveGetExternalContributorsSuccess = (
	siteId: SiteId,
	contributors: ExternalContributor
) => {
	return {
		type: EXTERNAL_CONTRIBUTORS_GET_REQUEST_SUCCESS,
		siteId,
		contributors,
	};
};

export const receiveGetExternalContributorsFailure = ( siteId: SiteId ) => {
	return {
		type: EXTERNAL_CONTRIBUTORS_GET_REQUEST_FAILURE,
		siteId,
	};
};

// export const addEmailForward = ( domainName, mailbox, destination ) => {
// 	return {
// 		type: EMAIL_FORWARDING_ADD_REQUEST,
// 		domainName,
// 		mailbox,
// 		destination,
// 	};
// };

// export const receiveAddEmailForwardSuccess = ( domainName, mailbox, verified ) => {
// 	return {
// 		type: EMAIL_FORWARDING_ADD_REQUEST_SUCCESS,
// 		domainName,
// 		mailbox,
// 		verified,
// 	};
// };

// export const receiveAddEmailForwardFailure = ( domainName, mailbox, destination, error ) => {
// 	return {
// 		type: EMAIL_FORWARDING_ADD_REQUEST_FAILURE,
// 		domainName,
// 		mailbox,
// 		destination,
// 		error,
// 	};
// };

// export const removeEmailForward = ( domainName, mailbox ) => {
// 	return {
// 		type: EMAIL_FORWARDING_REMOVE_REQUEST,
// 		domainName,
// 		mailbox,
// 	};
// };

// export const receiveRemoveEmailForwardSuccess = ( domainName, mailbox ) => {
// 	return {
// 		type: EMAIL_FORWARDING_REMOVE_REQUEST_SUCCESS,
// 		domainName,
// 		mailbox,
// 	};
// };

// export const receiveRemoveEmailForwardFailure = ( domainName, mailbox, error ) => {
// 	return {
// 		type: EMAIL_FORWARDING_REMOVE_REQUEST_FAILURE,
// 		domainName,
// 		mailbox,
// 		error,
// 	};
// };
