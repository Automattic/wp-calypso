/**
 * External dependencies
 */
import { compact, get } from 'lodash';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { WPCOM_HTTP_REQUEST } from 'state/action-types';
import { extendAction } from 'state/utils';

import {
	processEgress,
	processIngress,
} from './pipeline';

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
}, method, null );

export const successMeta = data => ( { meta: { dataLayer: { data } } } );
export const failureMeta = error => ( { meta: { dataLayer: { error } } } );
export const progressMeta = ( { total, loaded } ) => ( { meta: { dataLayer: { progress: { total, loaded } } } } );

const queueRequest = ( { dispatch }, rawAction, next ) => {
	const { action } = processIngress( rawAction, dispatch );

	if ( null === action ) {
		return next( action );
	}

	const {
		body,
		formData,
		method: rawMethod,
		onProgress,
		path,
		query = {},
	} = action;

	const method = rawMethod.toUpperCase();

	const request = fetcherMap( method )( ...compact( [
		{ path, formData },
		query,
		method === 'POST' && body,
		( rawError, rawData ) => {
			const { error, data, onFailure, onSuccess, shouldAbort } = processEgress( rawError, rawData, action, dispatch );

			if ( true === shouldAbort ) {
				return null;
			}

			return !! error
				? onFailure.forEach( handler => dispatch( extendAction( handler, failureMeta( error ) ) ) )
				: onSuccess.forEach( handler => dispatch( extendAction( handler, successMeta( data ) ) ) );
		}
	] ) );

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event => dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}

	return next( action );
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest ],
};
