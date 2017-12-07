/** @format */

/**
 * External dependencies
 */

import qs from 'qs';

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

	const {
		method: rawMethod,
		path,
		apiVersion,
		apiNamespace,
		body,
		query: rawQuery,
		formData,
		onProgress,
	} = action;

	const method = rawMethod.toUpperCase();
	const query = typeof rawQuery === 'string' ? rawQuery : qs.stringify( rawQuery );

	const request = wpcom.request(
		{
			method,
			path,
			apiVersion,
			apiNamespace,
			query,
			formData,
			body,
		},
		( error, data, headers ) => {
			const { failures, nextData, nextError, nextHeaders, shouldAbort, successes } = processInbound(
				action,
				{ dispatch },
				data,
				error,
				headers
			);

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
		}
	);

	if ( 'POST' === method && onProgress ) {
		request.upload.onprogress = event =>
			dispatch( extendAction( onProgress, progressMeta( event ) ) );
	}
};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest( outboundProcessor, inboundProcessor ) ],
};
