/**
 * Internal dependencies
 */
import { HTTP_REQUEST } from 'state/action-types';

/***
 * @typedef {Object} RequestDescription
 * @property {String} url the url to request
 * @property {String} method the method we should use in the request: GET, POST etc.
 * @property {Array<{Object}>} headers array of { key: '', value: '' } pairs for the request headers
 * @property {Object} body data send as body
 * @property {Boolean} withCredentials save cookie set on request
 * @property {Object|Function} onSuccess action to dispatch on success with data meta
 * @property {Object|Function} onFailure action to dispatch on failure with error meta
 * @property {Object} options other options
 */

/***
 * Creates a raw http action request
 *
 * @param {RequestDescription} request HTTP request description
 * @param {?Object} action default action to call on HTTP events
 * @returns {Object} raw http action
 */
export const rawHttp = ( {
	url,
	method,
	headers,
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
	body,
	withCredentials,
	onSuccess: onSuccess || action,
	onFailure: onFailure || action,
	options,
} );
