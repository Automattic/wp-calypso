/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	JETPACK_SCAN_UPDATE,
	JETPACK_SCAN_REQUEST,
	JETPACK_SCAN_REQUEST_SUCCESS,
	JETPACK_SCAN_REQUEST_FAILURE,
} from 'state/action-types';

const fetchStatus = action => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/scan`,
		},
		action
	);
};

const onFetchStatusSuccess = ( action, scanStatus ) => {
	return [
		{
			type: JETPACK_SCAN_REQUEST_SUCCESS,
			siteId: action.siteId,
		},
		{
			type: JETPACK_SCAN_UPDATE,
			siteId: action.siteId,
			payload: scanStatus,
		},
	];
};

const onFetchStatusFailure = ( ...response ) => {
	return [
		{
			type: JETPACK_SCAN_REQUEST_FAILURE,
			siteId: response.siteId,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan', {
	[ JETPACK_SCAN_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchStatus,
			onSuccess: onFetchStatusSuccess,
			onError: onFetchStatusFailure,
		} ),
	],
} );
