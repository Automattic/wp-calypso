/**
 * Internal dependencies
 */

import { WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';

/**
 * @typedef {object} RequestDescription
 * @property {string}   [apiVersion] specific API version for request
 * @property {string}   [apiNamespace] specific API namespace for request (preferred over version)
 * @property {object}   [body] JSON-serializable body for POST requests
 * @property {string}   method name of HTTP method to use
 * @property {string}   path WordPress.com API path with %s and %d placeholders, e.g. /sites/%s
 * @property {object}   [query] key/value pairs for query string
 * @property {FormData} [formData] key/value pairs for POST body, encoded as "multipart/form-data"
 * @property {object}   [onSuccess] Redux action to call when request succeeds
 * @property {object}   [onFailure] Redux action to call when request fails
 * @property {object}   [onProgress] Redux action to call on progress events from an upload
 * @property {object}   [onStreamRecord] callback for each record of a streamed response
 * @property {object}   [options] extra options to send to the middleware, e.g. retry policy or offline policy
 */

/**
 * Returns a valid WordPress.com API HTTP Request action object
 *
 * @param {RequestDescription} HTTP request description
 * @param {?object} action default action to call on HTTP events
 * @returns {object} Redux action describing WordPress.com API HTTP request
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
		onStreamRecord,
		...options
	},
	action = null
) => {
	const version = apiNamespace ? { apiNamespace } : { apiVersion };

	if ( process.env.NODE_ENV === 'development' ) {
		if ( ! ( action || onSuccess ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				'No success handler or default action supplied to the http action. You probably want one or the other. Path: %s',
				path
			);
		}
	}

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
		onStreamRecord: onStreamRecord || action,
		options,
	};
};
