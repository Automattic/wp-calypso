/** @format */

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
	processInbound as inboundProcessor,
	processOutbound as outboundProcessor,
} from './pipeline';

/**
 * Returns the appropriate fetcher in wpcom given the request method
 *
 * fetcherMap :: String -> (Params -> Query -> [Body] -> Promise)
 *
 * @param {string} method name of HTTP method for request
 * @returns {Function} the fetcher
 */
const fetcherMap = method =>
	get(
		{
			GET: wpcom.req.get.bind( wpcom.req ),
			POST: wpcom.req.post.bind( wpcom.req ),
		},
		method,
		null
	);

export const successMeta = ( data, headers ) => ( { meta: { dataLayer: { data, headers } } } );
export const failureMeta = ( error, headers ) => ( { meta: { dataLayer: { error, headers } } } );
export const progressMeta = ( { total, loaded } ) => ( {
	meta: { dataLayer: { progress: { total, loaded } } },
} );

export const queueRequest = ( processOutbound, processInbound ) => ( { dispatch }, rawAction ) => {
	const action = processOutbound( rawAction, dispatch );

	if ( null === action ) {
		return;
	}

	const { body, formData, method: rawMethod, onProgress, path, query = {} } = action;

	const method = rawMethod.toUpperCase();

	const request = fetcherMap( method )(
		...compact( [
			{ path, formData },
			{ ...query }, // wpcom mutates the query so hand it a copy
			method === 'POST' && body,
			( error, data, headers ) => {
				const {
					failures,
					nextData,
					nextError,
					nextHeaders,
					shouldAbort,
					successes,
				} = processInbound( action, { dispatch }, data, error, headers );

				if ( true === shouldAbort ) {
					return null;
				}

				return !! nextError
					? failures.forEach( handler =>
							dispatch( extendAction( handler, failureMeta( nextError, nextHeaders ) ) )
					  )
					: successes.forEach( handler =>
							dispatch( extendAction( handler, successMeta( nextData, nextHeaders ) ) )
					  );
			},
		] )
	);

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event =>
			dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest( outboundProcessor, inboundProcessor ) ],
};
