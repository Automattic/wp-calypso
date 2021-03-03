/**
 * Internal dependencies
 */
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { SECURE_YOUR_BRAND_REQUEST } from 'calypso/state/action-types';
import {
	secureYourBrandSuccessAction,
	secureYourBrandFailureAction,
} from 'calypso/state/secure-your-brand/actions';

/**
 * @module state/data-layer/wpcom/secure-your-brand
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
 * @param {Array} domains ns raw data from secure-your-brand API
 * @returns {Array<object>} Redux actions
 */
export const receiveSecureYourBrand = ( action, domains ) => [
	secureYourBrandSuccessAction( domains ),
];

/**
 * Dispatches returned error from secure-your-brand request
 *
 * @param {object} action Redux action
 * @param {object} rawError raw error from HTTP request
 * @returns {object} Redux action
 */
export const receiveError = ( action, rawError ) =>
	secureYourBrandFailureAction( rawError instanceof Error ? rawError.message : rawError );

export const dispatchSecureYourBrandRequest = dispatchRequest( {
	fetch: requestSecureYourBrand,
	onSuccess: receiveSecureYourBrand,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/secure-your-brand', {
	[ SECURE_YOUR_BRAND_REQUEST ]: [ dispatchSecureYourBrandRequest ],
} );
