/**
 * Internal dependencies
 */

import { HTTP_REQUEST } from 'calypso/state/action-types';

/**
 * @typedef {object} RequestDescription
 * @property {string} url the url to request
 * @property {string} method the method we should use in the request: GET, POST etc.
 * @property {Array<Array<string>>} headers array of [ 'key', 'value' ] pairs for the request headers
 * @property {Array<Array<string>>} queryParams array of [ 'key', 'value' ] pairs for the queryParams headers
 * @property {object} body data send as body
 * @property {boolean} withCredentials save cookie set on request
 * @property {object} onSuccess redux action to dispatch on success with data meta
 * @property {object} onFailure redux action to dispatch on failure with error meta
 * @property {object} options other options
 */

/**
 * Creates a raw http action request
 *
 * @param {RequestDescription} request HTTP request description
 * @param {?object} action default action to dispatch on HTTP success/failure
 * @returns {object} raw http action
 */
export const http = (
	{ url, method, headers, queryParams, body, withCredentials, onSuccess, onFailure, ...options },
	action = null
) => ( {
	type: HTTP_REQUEST,
	url,
	method,
	headers,
	queryParams,
	body,
	withCredentials,
	onSuccess: onSuccess || action,
	onFailure: onFailure || action,
	options,
} );
