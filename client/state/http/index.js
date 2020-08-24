/**
 * External dependencies
 */
import { fromPairs, identity, toPairs } from 'lodash';

/**
 * Internal dependencies
 */
import { extendAction } from 'state/utils';
import { HTTP_REQUEST } from 'state/action-types';
import { failureMeta, successMeta } from 'state/data-layer/wpcom-http';

const encodeQueryParameters = ( queryParams ) => {
	return queryParams
		.map(
			( [ queryKey, queryValue ] ) =>
				encodeURIComponent( queryKey ) + '=' + encodeURIComponent( queryValue )
		)
		.join( '&' );
};

const isAllHeadersValid = ( headers ) =>
	headers.every(
		( headerPair ) =>
			Array.isArray( headerPair ) &&
			headerPair.length === 2 &&
			typeof headerPair[ 0 ] === 'string' &&
			typeof headerPair[ 1 ] === 'string'
	);

/**
 * Handler to perform an http request based on `HTTP_REQUEST` action parameters:
 * {string} url the url to request
 * {string} method the method we should use in the request: GET, POST etc.
 * {Array<Array<String>>} headers array of [ 'key', 'value' ] pairs for the request headers
 * {Array<Array<String>>} queryParams array of [ 'key', 'value' ] pairs for the queryParams headers
 * {object|string} body data send as body
 * {boolean} withCredentials allows the remote server to view & set cookies (for its domain)
 * {Action} onSuccess action to dispatch on success with data meta
 * {Action} onFailure action to dispatch on failure with error meta
 *
 * @param {Function} dispatch redux store dispatch
 * @param {object} action dispatched action we need to handle
 */
export const httpHandler = async ( { dispatch }, action ) => {
	const {
		url,
		method,
		headers = [],
		queryParams = [],
		body,
		withCredentials,
		onSuccess,
		onFailure,
	} = action;

	if ( ! isAllHeadersValid( headers ) ) {
		const error = new Error( "Not all headers were of an array pair: [ 'key', 'value' ]" );
		dispatch( extendAction( onFailure, failureMeta( error ) ) );
		return;
	}

	const fetchHeaders = fromPairs( headers );
	fetchHeaders.Accept = 'application/json';

	const contentType = ( fetchHeaders[ 'Content-Type' ] || '' ).split( ';' )[ 0 ];

	let serialize;

	if ( contentType === 'application/x-www-form-urlencoded' ) {
		serialize = ( data ) => encodeQueryParameters( toPairs( data ) );
	} else if ( typeof body !== 'string' ) {
		serialize = JSON.stringify.bind( JSON );
	} else {
		// assume body is already serialized
		serialize = identity;
	}

	const queryString = encodeQueryParameters( queryParams );

	let response, json;
	try {
		response = await fetch( queryString.length ? `${ url }?${ queryString }` : url, {
			method,
			headers: fetchHeaders,
			body: serialize( body ),
			credentials: withCredentials ? 'include' : 'same-origin',
		} );
		json = await response.json();
	} catch ( error ) {
		dispatch( extendAction( onFailure, failureMeta( error ) ) );
		return;
	}

	if ( response.ok ) {
		dispatch( extendAction( onSuccess, successMeta( { body: json } ) ) );
	} else {
		dispatch( extendAction( onFailure, failureMeta( { response: { body: json } } ) ) );
	}
};

export default {
	[ HTTP_REQUEST ]: [ httpHandler ],
};
