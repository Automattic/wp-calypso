/**
 * Internal dependencies
 */
import { registerHandlers } from 'state/data-layer/handler-registry';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	JETPACK_SCAN_THREAT_REQUEST,
	JETPACK_SCAN_THREAT_REQUEST_SUCCESS,
	JETPACK_SCAN_THREAT_REQUEST_FAILURE,
} from 'state/action-types';

const fetchStatus = action => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			// @todo: make the query parameter dynamic
			path: `/sites/${ action.siteId }/alerts/${ action.threatId }?ignore=true`,
		},
		action
	);
};

const onFetchStatusSuccess = ( { siteId, threatId } ) => {
	return [
		{
			type: JETPACK_SCAN_THREAT_REQUEST_SUCCESS,
			siteId,
			threatId,
		},
		/*
		{
			type: JETPACK_SCAN_THREAT_UPDATE,
			siteId: action.siteId,
        },
        */
	];
};

const onFetchStatusFailure = ( { siteId, threatId } ) => {
	return [
		{
			type: JETPACK_SCAN_THREAT_REQUEST_FAILURE,
			siteId,
			threatId,
		},
	];
};

registerHandlers( 'state/data-layer/wpcom/sites/scan', {
	[ JETPACK_SCAN_THREAT_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchStatus,
			onSuccess: onFetchStatusSuccess,
			onError: onFetchStatusFailure,
		} ),
	],
} );
