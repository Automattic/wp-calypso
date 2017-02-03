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
		GET: wpcom.req.get.bind( wpcom.req ),
		POST: wpcom.req.post.bind( wpcom.req ),
	}, method, noop );

export const successMeta = data => ( { meta: { dataLayer: { data } } } );
export const failureMeta = error => ( { meta: { dataLayer: { error } } } );
export const progressMeta = ( { size: total, loaded } ) => ( { meta: { dataLayer: { progress: { total, loaded } } } } );
export const requestKey = ( { path, query } ) => Object
	.keys( query || {} )
	.sort()
	.reduce( ( memo, key ) => memo + `&${ key }=${ query[ key ] }`, `path=${ path }` );

const inflightRequests = new Set();

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
		options,
	} = action;

	const method = rawMethod.toUpperCase();

	/* Drop the request under the following conditions:
	 * 1. It is a GET request
	 * 2. allowDuplicateInflightRequests hasn't been set to truthy
	 * 3. There is a currently ongoing request for the same path with the same query
	 */
	if ( method === 'GET' &&
			! options.allowDuplicateInflightRequests &&
			! inflightRequests.has( requestKey( action ) ) ) {
		inflightRequests.add( requestKey( action ) );
		return;
	}

	const request = fetcherMap( method )( ...compact( [
		{ path, formData },
		query,
		method === 'POST' && body,
		( error, data ) => {
			if ( method === 'GET' && ! options.allowDuplicateInflightRequests ) {
				inflightRequests.delete( requestKey( path, query ) );
			}
			if ( !! error ) {
				return onFailure && dispatch( extendAction( onFailure, failureMeta( error ) ) );
			}
			return onSuccess && dispatch( extendAction( onSuccess, successMeta( data ) ) );
		}
	] ) );

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event => dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}

	next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest ],
};
