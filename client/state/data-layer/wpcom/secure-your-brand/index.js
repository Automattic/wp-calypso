/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { SECURE_YOUR_BRAND_REQUEST } from 'state/action-types';
import {
	getSecureYourBrandSuccess,
	getSecureYourBrandFailure,
} from 'state/secure-your-brand/actions';

/**
 * @module state/data-layer/wpcom/plans
 */

/**
 * Dispatches a request to fetch secure your brand suggestions
 *
 * @param {object} action Redux action
 * @returns {object} original action
 */
export const requestSecureYourBrand = ( action ) => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/domains/secure-your-brand/' + action.domain,
		},
		action
	);
};

/**
 * Dispatches returned WordPress.com secure your brand data
 *
 * @param {object} action Redux action
 * @param {Array} plans raw data from plans API
 * @returns {Array<object>} Redux actions
 */
export const receiveSecureYourBrand = ( action, plans ) => [ getSecureYourBrandSuccess( plans ) ];

/**
 * Dispatches returned error from plans request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
 */
export const receiveError = ( action, rawError ) =>
	getSecureYourBrandFailure( rawError instanceof Error ? rawError.message : rawError );

export const dispatchSecureYourBrandRequest = dispatchRequest( {
	fetch: requestSecureYourBrand,
	onSuccess: receiveSecureYourBrand,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/plans', {
	[ SECURE_YOUR_BRAND_REQUEST ]: [ dispatchSecureYourBrandRequest ],
} );
