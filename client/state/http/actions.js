/**
 * Internal dependencies
 */
import { HTTP_REQUEST } from 'state/action-types';

/***
 * @typedef {Object} RequestDescription
 * @property {String} url the url to request
 * @property {String} method the method we should use in the request: GET, POST etc.
 * @property {Array<Array<String>>} headers array of [ 'key', 'value' ] pairs for the request headers
 * @property {Array<Array<String>>} queryParams array of [ 'key', 'value' ] pairs for the queryParams headers
 * @property {Object} body data send as body
 * @property {Boolean} withCredentials save cookie set on request
 * @property {Object} onSuccess redux action to dispatch on success with data meta
 * @property {Object} onFailure redux action to dispatch on failure with error meta
 * @property {Object} options other options
 */

/***
 * Creates a raw http action request
 *
 * @param {RequestDescription} request HTTP request description
 * @param {?Object} action default action to dispatch on HTTP success/failure
 * @returns {Object} raw http action
 */
export const http = ( {
	url,
	method,
	headers,
	queryParams,
	body,
	withCredentials,
	onSuccess,
	onFailure,
	...options,
}, action = null ) => ( {
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
