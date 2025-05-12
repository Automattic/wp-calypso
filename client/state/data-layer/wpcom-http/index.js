import { extendAction } from '@automattic/state-utils';
import debugModule from 'debug';
import { get } from 'lodash';
import wpcom, { wpcomJetpackLicensing } from 'calypso/lib/wp';
import { WPCOM_HTTP_REQUEST } from 'calypso/state/action-types';
import {
	processInbound as inboundProcessor,
	processOutbound as outboundProcessor,
} from './pipeline';

const debug = debugModule( 'calypso:data-layer:wpcom-http' );

/**
 * Returns the appropriate fetcher in wpcom given the request method
 *
 * fetcherMap :: String -> (Params -> Query -> [Body] -> Promise)
 * @param {string} method name of HTTP method for request
 * @param {string} fetcher Name of fetcher to use. Defaults to wpcom.
 * @returns {Function} the fetcher
 */
const fetcherMap = function ( method, fetcher = 'wpcom' ) {
	const req = 'wpcomJetpackLicensing' === fetcher ? wpcomJetpackLicensing.req : wpcom.req;

	return get(
		{
			GET: req.get.bind( req ),
			POST: req.post.bind( req ),
		},
		method,
		null
	);
};

export const successMeta = ( data, headers ) => ( { meta: { dataLayer: { data, headers } } } );
export const failureMeta = ( error, headers ) => ( { meta: { dataLayer: { error, headers } } } );
export const progressMeta = ( { total, loaded } ) => ( {
	meta: { dataLayer: { progress: { total, loaded } } },
} );
export const streamRecordMeta = ( streamRecord ) => ( { meta: { dataLayer: { streamRecord } } } );

export const queueRequest =
	( processOutbound, processInbound ) =>
	( { dispatch }, rawAction ) => {
		const action = processOutbound( rawAction, dispatch );

		if ( null === action ) {
			return;
		}

		const {
			body,
			formData,
			onStreamRecord: rawOnStreamRecord,
			method: rawMethod,
			onProgress,
			options,
			path,
			query = {},
		} = action;
		const { responseType, isLocalApiCall } = options || {};
		const fetcher = get( options, 'options.fetcher', 'wpcom' );

		const onStreamRecord =
			rawOnStreamRecord &&
			( ( record ) => {
				return dispatch( extendAction( rawOnStreamRecord, streamRecordMeta( record ) ) );
			} );

		const method = rawMethod.toUpperCase();

		const request = fetcherMap(
			method,
			fetcher
		)(
			...[
				{ path, formData, onStreamRecord, responseType, isLocalApiCall },
				{ ...query }, // wpcom mutates the query so hand it a copy
				method === 'POST' && body,
				( error, data, headers ) => {
					debug( 'callback fn by Req method: error=%o data=%o headers=%o', error, data, headers );

					const { failures, nextData, nextError, nextHeaders, shouldAbort, successes } =
						processInbound( action, { dispatch }, data, error, headers );

					if ( true === shouldAbort ) {
						return null;
					}

					return nextError
						? failures.forEach( ( handler ) =>
								dispatch( extendAction( handler, failureMeta( nextError, nextHeaders ) ) )
						  )
						: successes.forEach( ( handler ) =>
								dispatch( extendAction( handler, successMeta( nextData, nextHeaders ) ) )
						  );
				},
			].filter( Boolean )
		);

		if ( 'POST' === method && onProgress ) {
			// wpcomProxyRequest request - wpcomXhrRequests come through here with .upload
			if ( request.upload ) {
				request.upload.onprogress = ( event ) =>
					dispatch( extendAction( onProgress, progressMeta( event ) ) );
			}
		}
	};

export default {
	[ WPCOM_HTTP_REQUEST ]: [ queueRequest( outboundProcessor, inboundProcessor ) ],
};
