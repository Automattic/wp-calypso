/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import type { APIFetchOptions } from '@wordpress/api-fetch';

/**
 * Parses the apiFetch response.
 * @param {Response} response
 * @param {boolean}  shouldParseResponse
 * @returns {Promise<any> | null | Response} Parsed response.
 */
const parseResponse = ( response: Response, shouldParseResponse = true ) => {
	if ( shouldParseResponse ) {
		if ( response.status === 204 ) {
			return null;
		}

		return response.json ? response.json() : Promise.reject( response );
	}

	return response;
};

/**
 * Calls the `json` function on the Response, throwing an error if the response
 * doesn't have a json function or if parsing the json itself fails.
 * @param {Response} response
 * @returns {Promise<any>} Parsed response.
 */
const parseJsonAndNormalizeError = ( response: Response ) => {
	const invalidJsonError = {
		code: 'invalid_json',
		message: __( 'The response is not a valid JSON response.' ),
	};

	if ( ! response || ! response.json ) {
		throw invalidJsonError;
	}

	return response.json().catch( () => {
		throw invalidJsonError;
	} );
};

/**
 * Parses the apiFetch response properly and normalize response errors.
 * @param {Response} response
 * @param {boolean}  shouldParseResponse
 * @returns {Promise<any>} Parsed response.
 */
export const parseResponseAndNormalizeError = (
	response: Response,
	shouldParseResponse = true
) => {
	return Promise.resolve( parseResponse( response, shouldParseResponse ) ).catch( ( res ) =>
		parseAndThrowError( res, shouldParseResponse )
	);
};

/**
 * Parses a response, throwing an error if parsing the response fails.
 * @param {Response} response
 * @param {boolean}  shouldParseResponse
 * @returns {Promise<any>} Parsed response.
 */
export function parseAndThrowError( response: Response, shouldParseResponse = true ) {
	if ( ! shouldParseResponse ) {
		throw response;
	}

	return parseJsonAndNormalizeError( response ).then( ( error ) => {
		const unknownError = {
			code: 'unknown_error',
			message: __( 'An unknown error occurred.' ),
		};

		throw error || unknownError;
	} );
}

/**
 * Default set of header values which should be sent with every request unless
 * explicitly provided through apiFetch options.
 * @type {Record<string, string>}
 */
const DEFAULT_HEADERS = {
	// The backend uses the Accept header as a condition for considering an
	// incoming request as a REST request.
	//
	// See: https://core.trac.wordpress.org/ticket/44534
	Accept: 'application/json, */*;q=0.1',
};

/**
 * Default set of fetch option values which should be sent with every request
 * unless explicitly provided through apiFetch options.
 * @type {Object}
 */
const DEFAULT_OPTIONS: APIFetchOptions = {
	credentials: 'include',
};

/**
 * Checks the status of a response, throwing the Response as an error if
 * it is outside the 200 range.
 * @param {Response} response
 * @returns {Response} The response if the status is in the 200 range.
 */
const checkStatus = ( response: Response ) => {
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}

	throw response;
};

const defaultFetchHandler = ( nextOptions: APIFetchOptions ) => {
	const { url, path, data, parse = true, ...remainingOptions } = nextOptions;
	let { body, headers } = nextOptions;

	// Merge explicitly-provided headers with default values.
	headers = { ...DEFAULT_HEADERS, ...headers };

	// The `data` property is a shorthand for sending a JSON body.
	if ( data ) {
		body = JSON.stringify( data );
		headers[ 'Content-Type' ] = 'application/json';
	}

	const responsePromise = window.fetch(
		// Fall back to explicitly passing `window.location` which is the behavior if `undefined` is passed.
		url || path || window.location.href,
		{
			...DEFAULT_OPTIONS,
			...remainingOptions,
			body,
			headers,
		}
	);

	return responsePromise.then(
		( value ) =>
			Promise.resolve( value )
				.then( checkStatus )
				.catch( ( response ) => parseAndThrowError( response, parse ) )
				.then( ( response ) => parseResponseAndNormalizeError( response, parse ) ),
		( err ) => {
			// Re-throw AbortError for the users to handle it themselves.
			if ( err && err.name === 'AbortError' ) {
				throw err;
			}

			// Otherwise, there is most likely no network connection.
			// Unfortunately the message might depend on the browser.
			throw {
				code: 'fetch_error',
				message: __( 'You are probably offline.' ),
			};
		}
	);
};

export default defaultFetchHandler;
