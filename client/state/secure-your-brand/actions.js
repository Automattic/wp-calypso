/**
 * Internal dependencies
 */
import {
	SECURE_YOUR_BRAND_REQUEST,
	SECURE_YOUR_BRAND_FAILURE,
	SECURE_YOUR_BRAND_SUCCESS,
} from 'calypso/state/action-types';

import 'calypso/state/secure-your-brand/init';
import 'calypso/state/data-layer/wpcom/secure-your-brand/index';

/**
 * Returns an action object to request suggested secure your brand domains
 *
 * @param {string} domain - The domain for which we look alternatives to secure
 * @returns {object} - Action objeect
 */
export const secureYourBrandRequestAction = ( domain ) => {
	const action = {
		type: SECURE_YOUR_BRAND_REQUEST,
		domain,
	};
	return action;
};
/**
 * Returns an action object for signalling that a request was successful and domains received.
 *
 * @param {object} secureYourBrand - The results including domains, pricing, and a discount
 * @returns {object} Action object
 */
export const secureYourBrandSuccessAction = ( secureYourBrand ) => {
	const action = {
		type: SECURE_YOUR_BRAND_SUCCESS,
		secureYourBrand,
	};
	return action;
};

/**
 * Returns an action object for signalling that a request failed.
 *
 * @param {object} error - error message according to REST-API error response
 * @returns {object} Action object
 */
export const secureYourBrandFailureAction = ( error ) => {
	const action = {
		type: SECURE_YOUR_BRAND_FAILURE,
		error,
	};
	return action;
};
