import { ATOMIC_SOFTWARE_REQUEST_STATUS } from 'calypso/state/action-types';
import {
	setAtomicSoftwareStatus,
	setAtomicSoftwareError,
} from 'calypso/state/atomic/software/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const requestSoftware = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/software/${ action.softwareSet }`,
			retryPolicy: noRetry(),
		},
		action
	);

const receiveSoftwareResponse = ( action, response ) => [
	setAtomicSoftwareStatus( action.siteId, action.softwareSet, response ),
];

const receiveSoftwareError = ( action, error ) => [
	setAtomicSoftwareError( action.siteId, action.softwareSet, error ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/software', {
	[ ATOMIC_SOFTWARE_REQUEST_STATUS ]: [
		dispatchRequest( {
			fetch: requestSoftware,
			onSuccess: receiveSoftwareResponse,
			onError: receiveSoftwareError,
		} ),
	],
} );
