import { ATOMIC_TRANSFER_REQUEST_LATEST } from 'calypso/state/action-types';
import { setLatestAtomicTransfer } from 'calypso/state/atomic/transfers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const requestLatestAtomicTransfer = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: `/sites/${ action.siteId }/atomic/transfers/latest`,
		},
		action
	);

const receiveError = ( action, error ) => [ setLatestAtomicTransfer( action.siteId, error ) ];

const receiveResponse = ( action, response ) => [
	setLatestAtomicTransfer( action.siteId, response ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfers/latest', {
	[ ATOMIC_TRANSFER_REQUEST_LATEST ]: [
		dispatchRequest( {
			fetch: requestLatestAtomicTransfer,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
