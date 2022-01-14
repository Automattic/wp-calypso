import { ATOMIC_TRANSFER_INITIATE_TRANSFER } from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import {
	setLatestAtomicTransfer,
	setLatestAtomicTransferError,
} from 'calypso/state/atomic/transfers/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

const initiateAtomicTransfer = ( action ) =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: `/sites/${ action.siteId }/atomic/transfers/`,
			...( action.softwareSet
				? {
						body: {
							software_set: action.softwareSet,
						},
				  }
				: {} ),
		},
		action
	);

const receiveResponse = ( action, transfer ) => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_success', {
		context: 'atomic_transfer',
	} ),
	setLatestAtomicTransfer( action.siteId, transfer ),
];

const receiveError = ( action, error ) => [
	recordTracksEvent( 'calypso_atomic_transfer_inititate_failure', {
		context: 'atomic_transfer',
		error: error.error,
	} ),
	setLatestAtomicTransferError( action.siteId, error ),
];

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfers', {
	[ ATOMIC_TRANSFER_INITIATE_TRANSFER ]: [
		dispatchRequest( {
			fetch: initiateAtomicTransfer,
			onSuccess: receiveResponse,
			onError: receiveError,
		} ),
	],
} );
