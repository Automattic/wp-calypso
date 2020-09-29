/**
 * Internal dependencies
 */
import {
	SECURE_YOUR_BRAND_REQUEST,
	SECURE_YOUR_BRAND_FAILURE,
	SECURE_YOUR_BRAND_SUCCESS,
} from 'state/action-types';

import 'state/secure-your-brand/init';
import 'state/data-layer/wpcom/secure-your-brand/index';

/**
 * Returns an action object to request suggested secure your brand domains
 *
 * @param {string} domain - The domain for which we look alternatives to secure
 * @returns {object} - Action objeect
 */
export const getSecureYourBrand = ( domain ) => {
	const action = {
		type: SECURE_YOUR_BRAND_REQUEST,
		domain,
	};
	return action;
};
/**
 * Returns an action object for signalling that a request was successful and domains received.
 *
 * @param {Array} domains - The domain items suggested by the server
 * @returns {object} Action object
 */
export const getSecureYourBrandSuccess = ( domains ) => {
	const action = {
		type: SECURE_YOUR_BRAND_SUCCESS,
		domains,
	};
	return action;
};

/**
 * Returns an action object for signalling that a request failed.
 *
 * @param {object} error - error message according to REST-API error response
 * @returns {object} Action object
 */
export const getSecureYourBrandFailure = ( error ) => {
	const action = {
		type: SECURE_YOUR_BRAND_FAILURE,
		error,
	};
	return action;
};
