import { ATOMIC_TRANSFER_REQUEST_LATEST } from 'calypso/state/action-types';
import {
	setLatestAtomicTransfer,
	setLatestAtomicTransferError,
} from 'calypso/state/atomic/transfers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const requestLatestAtomicTransfer = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/transfers/latest`,
			retryPolicy: noRetry(),
		},
		action
	);

const receiveResponse = ( action, transfer ) => [
	setLatestAtomicTransfer( action.siteId, transfer ),
];
const receiveError = ( action, error ) => [ setLatestAtomicTransferError( action.siteId, error ) ];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfers/latest', {
	[ ATOMIC_TRANSFER_REQUEST_LATEST ]: [
		dispatchRequest( {
			fetch: requestLatestAtomicTransfer,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
