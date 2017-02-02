/**
 * External dependencies
 */
import { compact, get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { extendAction } from 'state/utils';
import inflight from 'lib/inflight';

/**
 * Returns the appropriate fetcher in wpcom given the request method
 *
 * fetcherMap :: String -> (Params -> Query -> [Body] -> Promise)
 *
 * @param {string} method name of HTTP method for request
 * @returns {Function} the fetcher
 */
const fetcherMap = method =>
	get( {
		GET: ( args ) => wpcom.req.get( ...args ),
		POST: ( args ) => wpcom.req.post( ...args ),
	}, method, noop );

export const successMeta = data => ( { meta: { dataLayer: { data } } } );
export const failureMeta = error => ( { meta: { dataLayer: { error } } } );
export const progressMeta = ( { size: total, loaded } ) => ( { meta: { dataLayer: { progress: { total, loaded } } } } );
export const requestKey = ( { path, query } ) =>
	`{ type: ${ WPCOM_HTTP_REQUEST }, path: ${ path }, query: ${ query } }`;

export const queueRequest = ( { dispatch }, action, next ) => {
	const {
		body = {},
		formData,
		method: rawMethod,
		onSuccess,
		onFailure,
		onProgress,
		path,
		query = {},
		dedupe,
	} = action;

	const method = rawMethod.toUpperCase();

	/* Eat the request under the following conditions:
	 * 1. Dedupe flag is set true
	 * 2. It is a GET request
	 * 3. There is a currently ongoing request for the same path with the same query
	 */
	if ( method === 'GET' && dedupe && inflight.requestInflight( requestKey( action ) ) ) {
		return;
	}

	const baseRequest = fetcherMap( method )( ...compact( [
		{ path, formData },
		query,
		method === 'POST' && body,
	] ) );

	const request = method === 'GET' && dedupe
		? inflight.promiseTracker( requestKey( action ), baseRequest )
		: baseRequest;

	request.then(
		data => onSuccess && dispatch( extendAction( onSuccess, successMeta( data ) ) ),
		error => onFailure && dispatch( extendAction( onFailure, failureMeta( error ) ) )
	);

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event => dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}

	next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest ],
};
