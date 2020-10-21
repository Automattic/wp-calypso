/**
 * Internal dependencies
 */
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import {
	JETPACK_SCAN_THREAT_COUNTS_REQUEST,
	JETPACK_SCAN_THREAT_COUNTS_REQUEST_SUCCESS,
	JETPACK_SCAN_THREAT_COUNTS_REQUEST_FAILURE,
	JETPACK_SCAN_THREAT_COUNTS_UPDATE,
} from 'calypso/state/action-types';

export const requestThreatCounts = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/scan/counts`,
			apiNamespace: 'wpcom/v2',
			retryPolicy: noRetry(),
		},
		action
	);

// There's also a property on the response called 'success',
// but we already know at this point whether or not the request succeeded,
// so we can safely exclude it from the data we pass back into the state tree
const fromApi = ( response ) => response.counts;

const onSuccess = ( { siteId }, counts ) => [
	{
		type: JETPACK_SCAN_THREAT_COUNTS_REQUEST_SUCCESS,
		siteId,
	},
	{
		type: JETPACK_SCAN_THREAT_COUNTS_UPDATE,
		siteId,
		counts,
	},
];

const onError = ( { siteId } ) => [
	{
		type: JETPACK_SCAN_THREAT_COUNTS_REQUEST_FAILURE,
		siteId,
	},
];

registerHandlers( 'state/data-layer/wpcom/sites/scan/threat-counts/index.js', {
	[ JETPACK_SCAN_THREAT_COUNTS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestThreatCounts,
			onSuccess,
			onError,
			fromApi,
		} ),
	],
} );
