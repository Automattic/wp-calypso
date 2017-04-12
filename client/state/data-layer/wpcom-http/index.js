/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { extendAction } from 'state/utils';

import {
	processInbound as inboundProcessor,
	processOutbound as outboundProcessor,
} from './pipeline';

/**
 * Returns the appropriate fetcher in wpcom given the request method
 *
 * fetcherMap :: String -> (Params -> Query -> [Body] -> Promise)
 *
 * @param {string} method name of HTTP method for request
 * @param {string} wpcomReq wpcom.req object (exposed for easier testing)
 * @returns {Function} the fetcher
 */
export const fetcherMap = ( method, wpcomReq ) => get( {
	GET: ( { path, query = {} }, callback ) => wpcomReq.get(
		{ path },
		query,
		callback
	),
	POST: ( { body = {}, formData, path, query = {}, }, callback ) => wpcomReq.post(
		Object.assign(
			{ path },
			formData && { formData }
		),
		query,
		// NOTE: We prioritize formData over body, wpcom.js will overwrite any
		// formData in presence of a body
		formData ? null : body,
		callback
	),
}, method, null );

export const successMeta = data => ( { meta: { dataLayer: { data } } } );
export const failureMeta = error => ( { meta: { dataLayer: { error } } } );
export const progressMeta = ( { total, loaded } ) => ( { meta: { dataLayer: { progress: { total, loaded } } } } );

export const queueRequest = ( processOutbound, processInbound ) => ( { dispatch }, rawAction, next ) => {
	const action = processOutbound( rawAction, dispatch );

	if ( null === action ) {
		return next( rawAction );
	}

	const {
		method: rawMethod,
		onProgress,
	} = action;

	const method = rawMethod.toUpperCase();

	const request = fetcherMap( method, wpcom.req )(
		action,
		( error, data ) => {
			const {
				failures,
				nextData,
				nextError,
				shouldAbort,
				successes
			} = processInbound( action, { dispatch }, data, error );

			if ( true === shouldAbort ) {
				return null;
			}

			return !! nextError
				? failures.forEach( handler => dispatch( extendAction( handler, failureMeta( nextError ) ) ) )
				: successes.forEach( handler => dispatch( extendAction( handler, successMeta( nextData ) ) ) );
		}
	);

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event => dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}

	return next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest( outboundProcessor, inboundProcessor ) ],
};
