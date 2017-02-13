/**
 * Internal dependencies
 */
import { WPCOM_HTTP_REQUEST } from 'state/action-types';

export const apiVersionPattern = /^v(?:(\d+)\.)?(\d+)$/;
export const apiNamespacePattern = /^([a-z]+)\/?v(\d+)$/;

const noVersionAndNamespaceUndefined = ( { apiNamespace, apiVersion } ) => {
	if ( typeof apiNamespace === 'undefined' && typeof apiVersion === 'undefined' ) {
		throw new TypeError(
			'One of `apiNamespace` and `apiVersion` must be defined (see wpcom.js/README.md)'
		);
	}
};

const noVersionAndNamespaceConflicts = ( { apiNamespace, apiVersion } ) => {
	if ( apiNamespace && apiVersion ) {
		throw new TypeError(
			'Cannot simultaneously define `apiNamespace` and `apiVersion` (see wpcom.js/README.md)'
		);
	}
};

const hasViableVersion = ( { apiVersion, apiNamespace } ) => {
	if ( ! apiVersion && apiNamespace ) {
		return;
	}

	if ( ! ( apiVersion && apiVersionPattern.test( apiVersion ) ) ) {
		throw new TypeError(
			`Given 'apiVersion' of '${ apiVersion }' doesn't match pattern: v1, v1.1, v2, etc…`
		);
	}
};

const hasViableNamespace = ( { apiVersion, apiNamespace } ) => {
	if ( apiVersion ) {
		return;
	}

	if ( ! apiNamespacePattern.test( apiNamespace ) ) {
		throw new TypeError(
			`Given 'apiNamespace' of '${ apiNamespace }' doesn't match pattern: wp/v1, wp/v2, wpcom/v2, etc…`
		);
	}
};

const noUndefinedPath = ( { path } ) => {
	if ( ! path || typeof path !== 'string' ) {
		throw new TypeError( `{ path: ${ path } } param is invalid.` );
	}
};

const noUnknownMethodName = ( { method } ) => {
	if ( ! method || ( method !== 'GET' && method !== 'POST' ) ) {
		throw new TypeError( `{ method: ${ method } } param is invalid.` );
	}
};

const validators = [
	noVersionAndNamespaceConflicts,
	noVersionAndNamespaceUndefined,
	hasViableVersion,
	hasViableNamespace,
	noUndefinedPath,
	noUnknownMethodName,
];

/**
 * Returns a valid WordPress.com API HTTP Request action object
 *
 * @param {string} [apiVersion] specific API version for request
 * @param {string} [apiNamespace] specific API namespace for request
 * @param {Object} [body] JSON-serializable body for POST requests
 * @param {string} method name of HTTP method to use
 * @param {string} path WordPress.com API path with %s and %d placeholders, e.g. /sites/%s
 * @param {Object} [query] key/value pairs for query string
 * @param {FormData} [formData] key/value pairs for POST body, encoded as "multipart/form-data"
 * @param {Object} [onSuccess] Redux action to call when request succeeds
 * @param {Object} [onFailure] Redux action to call when request fails
 * @param {Object} [onProgress] Redux action to call on progress events from an upload
 * @param {Object} [options] extra options to send to the middleware, e.g. retry policy or offline policy
 * @param {Object} [action] default action to call on HTTP events
 * @returns {Object} Redux action describing WordPress.com API HTTP request
 */
export const http = ( request, action = null ) => {
	const {
		apiVersion,
		apiNamespace,
		body = {},
		method,
		formData,
		path,
		query = {},
		onSuccess,
		onFailure,
		onProgress,
		...options
	} = request;

	// validate request and throw on error
	validators.forEach( validator => validator( request ) );

	const actionProperties = {
		body,
		onSuccess: onSuccess || action,
		onFailure: onFailure || action,
		onProgress: onProgress || action,
		query: { ...query },
		options,
	};

	if ( apiVersion ) {
		actionProperties.query.apiVersion = apiVersion;
	}

	if ( apiNamespace ) {
		actionProperties.query.apiNamespace = apiNamespace;
	}

	// formData is optional
	if ( formData ) {
		actionProperties.formData = FormData;
	}

	// optional parameters
	if ( typeof formData !== 'undefined' ) {
		actionProperties.formData = [];
	}

	return {
		...actionProperties,
		type: WPCOM_HTTP_REQUEST,
		path,
		method,
	};
};
