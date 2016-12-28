/**
 * External dependencies
 */
import { get, noop } from 'lodash';

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
const fetcherMap = method => get( {
	GET: wpcom.req.get.bind( wpcom.req ),
	POST: wpcom.req.post.bind( wpcom.req ),
}, method, noop );

export const successMeta = data => ( { meta: { dataLayer: { data } } } );
export const failureMeta = error => ( { meta: { dataLayer: { error } } } );

const queueRequest = ( { dispatch }, action, next ) => {
	const {
		body,
		method,
		onSuccess,
		onFailure,
		path,
		query,
	} = action;

	fetcherMap( method.toUpperCase() )( path, query, body )
		.then( response => dispatch( extendAction( onSuccess, successMeta( response ) ) ) )
		.catch( error => dispatch( extendAction( onFailure, failureMeta( error ) ) ) );

	next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest ],
};
