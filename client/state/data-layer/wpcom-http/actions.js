/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

/**
 * Returns a valid WordPress.com API HTTP Request action object
 *
 * @param {string} [apiVersion]  speciific API version for request
 * @param {Object} [body] JSON-serializable body for POST requests
 * @param {string} method name of HTTP method to use
 * @param {string} path WordPress.com API path with %s and %d placeholders, e.g. /sites/%s
 * @param {Array} [pathArgs] data to replace placeholders with, in order, e.g. [ 'blarg.wordpress.com' ]
 * @param {Object} [query] key/value pairs for query string
 * @param {FormData} [formData] key/value pairs for POST body, encoded as "multipart/form-data"
 * @param {Object} [onSuccess] Redux action to call when request succeeds
 * @param {Object} [onFailure] Redux action to call when request fails
 * @param {Object} [onProgress] Redux action to call on progress events from an upload
 * @param {Object} [options] extra options to send to the middleware, e.g. retry policy or offline policy
 * @returns {Object} Redux action describing WordPress.com API HTTP request
 */
export const http = ( {
	apiVersion,
	body,
	method,
	path,
	pathArgs,
	query,
	formData,
	onSuccess,
	onFailure,
	onProgress,
	...options,
} ) => ( {
	type: WPCOM_HTTP_REQUEST,
	body,
	method,
	path,
	pathArgs,
	query: { ...query, apiVersion },
	formData,
	onSuccess,
	onFailure,
	onProgress,
	options,
} );
