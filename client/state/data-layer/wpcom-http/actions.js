/** @format */
/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

/**
 * @typedef {Object} RequestDescription
 * @property {?String} apiVersion specific API version for request
 * @property {?String} apiNamespace specific API namespace for request (preferred over version)
 * @property {?Object} body JSON-serializable body for POST requests
 * @property {string} method name of HTTP method to use
 * @property {string} path WordPress.com API path with %s and %d placeholders, e.g. /sites/%s
 * @property {?Object} query key/value pairs for query string
 * @property {?FormData} formData key/value pairs for POST body, encoded as "multipart/form-data"
 * @property {?Object} onSuccess Redux action to call when request succeeds
 * @property {?Object} onFailure Redux action to call when request fails
 * @property {?Object} onProgress Redux action to call on progress events from an upload
 * @property {?Object} options extra options to send to the middleware, e.g. retry policy or offline policy
 */

/**
 * Returns a valid WordPress.com API HTTP Request action object
 *
 * @param {RequestDescription} HTTP request description
 * @param {?Object} action default action to call on HTTP events
 * @returns {Object} Redux action describing WordPress.com API HTTP request
 */
export const http = (
	{
		apiVersion,
		apiNamespace,
		body,
		method,
		path,
		query = {},
		formData,
		onSuccess,
		onFailure,
		onProgress,
		...options
	},
	action = null
) => {
	const version = apiNamespace ? { apiNamespace } : { apiVersion };

	return {
		type: WPCOM_HTTP_REQUEST,
		body,
		method,
		path,
		query: { ...query, ...version },
		formData,
		onSuccess: onSuccess || action,
		onFailure: onFailure || action,
		onProgress: onProgress || action,
		options,
	};
};
