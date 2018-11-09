/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Determines whether the SMS message request is in progress.
 *
 * @param {Object} state - global state tree
 * @return {Boolean} true if the request is in progress, false otherwise
 */
export const isAppSMSRequestSending = state => {
	return get( state, [ 'mobileDownloadSMS', 'isPerformingRequest' ], true );
};

/**
 * Determines whether the SMS message request completed successfully
 *
 * @param {Object} state - global state tree
 * @return {Boolean} true if the request was successful, false otherwise
 */
export const didAppSMSRequestCompleteSuccessfully = state => {
	return get( state, [ 'mobileDownloadSMS', 'status' ], null ) === 'success';
};

/**
 * Determines whether the SMS message was not completed successfully
 *
 * @param {Object} state - global state tree
 * @return {Boolean} true if the request was not successful, false otherwise
 */
export const didAppSMSRequestCompleteWithError = state => {
	return get( state, [ 'mobileDownloadSMS', 'status' ], null ) === 'error';
};
