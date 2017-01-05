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
export const progressMeta = ( { size: total, loaded } ) => ( { meta: { dataLayer: { progress: { total, loaded } } } } );

const queueRequest = ( { dispatch }, action, next ) => {
	const {
		body,
		formData,
		method,
		onSuccess,
		onFailure,
		onProgress,
		path,
		query,
	} = action;

	const request = fetcherMap( method.toUpperCase() )(
		{ path, formData },
		query,
		body,
		( error, data ) => !! error
			? dispatch( extendAction( onFailure, failureMeta( error ) ) )
			: dispatch( extendAction( onSuccess, successMeta( data ) ) )
	);

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event => dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}

	next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest ],
};
