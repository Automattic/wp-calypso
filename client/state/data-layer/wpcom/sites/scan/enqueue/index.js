/**
 * Internal dependencies
 */
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	JETPACK_SCAN_ENQUEUE_UPDATE,
	JETPACK_SCAN_ENQUEUE_REQUEST,
	JETPACK_SCAN_ENQUEUE_REQUEST_SUCCESS,
	JETPACK_SCAN_ENQUEUE_REQUEST_FAILURE,
} from 'calypso/state/action-types';

// NOTE: This is currently a mock endpoint.
// It always returns the following payload:
// ```
// { "enqueue": true }
// ```
const enqueueScan = ( action ) => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/scan/enqueue`,
			body: {},
		},
		action
	);
};

const onEnqueueScanSuccess = ( action, enqueueResult ) => {
	return [
		{
			type: JETPACK_SCAN_ENQUEUE_REQUEST_SUCCESS,
			siteId: action.siteId,
		},
		{
			type: JETPACK_SCAN_ENQUEUE_UPDATE,
			siteId: action.siteId,
			payload: enqueueResult,
		},
	];
};

const onEnqueueScanFailure = ( ...response ) => {
	return [
		{
			type: JETPACK_SCAN_ENQUEUE_REQUEST_FAILURE,
			siteId: response.siteId,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan/enqueue', {
	[ JETPACK_SCAN_ENQUEUE_REQUEST ]: [
		dispatchRequest( {
			fetch: enqueueScan,
			onSuccess: onEnqueueScanSuccess,
			onError: onEnqueueScanFailure,
		} ),
	],
} );
