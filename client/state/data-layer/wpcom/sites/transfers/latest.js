import { ATOMIC_TRANSFER_REQUEST } from 'calypso/state/action-types';
import { fetchAtomicTransfer, setAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import getAtomicTransfer from 'calypso/state/selectors/get-atomic-transfer';
import { requestSite } from 'calypso/state/sites/actions';

export const TRANSFER_POLL_DEADLINE_MS = 5 * 60 * 1000;

const POLL_INTERVAL_MS = 10000;
const MISSING_RECORD_ATTEMPTS = 6;

const settledStates = [ transferStates.COMPLETED, transferStates.ERROR, transferStates.REVERTED ];

// Timers only. The verdict of a wait lives in the store, as CLIENT_TIMEOUT on the site's transfer.
const waits = new Map();

const stopWait = ( siteId ) => {
	const wait = waits.get( siteId );

	clearTimeout( wait?.pollTimerId );
	clearTimeout( wait?.deadlineTimerId );
	waits.delete( siteId );
};

export const clearTransferWaits = () => {
	for ( const siteId of [ ...waits.keys() ] ) {
		stopWait( siteId );
	}
};

const schedulePoll = ( siteId, dispatch ) => {
	const wait = waits.get( siteId );

	clearTimeout( wait?.pollTimerId );
	waits.set( siteId, {
		...wait,
		pollTimerId: setTimeout( () => dispatch( fetchAtomicTransfer( siteId ) ), POLL_INTERVAL_MS ),
	} );
};

const giveUp = ( siteId, dispatch, transfer = {} ) => {
	stopWait( siteId );
	dispatch( setAtomicTransfer( siteId, { ...transfer, status: transferStates.CLIENT_TIMEOUT } ) );
};

// Two consumers poll the same site, and a response can arrive after we stopped waiting, so every
// entry point asks the store first: a wait that already ended in a timeout must not revive the
// progress bar. A response carrying a different transfer means a new wait, which may proceed.
const gaveUp = ( getState, siteId, transferId ) => {
	const stored = getAtomicTransfer( getState(), siteId );

	return (
		stored.status === transferStates.CLIENT_TIMEOUT &&
		( transferId === undefined || stored.atomic_transfer_id === transferId )
	);
};

const keepWaiting = ( siteId, dispatch, getState ) =>
	gaveUp( getState, siteId ) ? giveUp( siteId, dispatch ) : schedulePoll( siteId, dispatch );

export const requestTransfer = ( action ) => [
	// Keep the default exponential backoff for transient failures; onTransferError handles the rest.
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/transfers/latest`,
			apiVersion: '1.2',
		},
		action
	),
	// Responses are the only other thing that ends a wait, so a request that never answers — a
	// stalled connection, a frozen tab — would wait forever without this. One timer per wait: a
	// second request joins the deadline already running instead of opening a new one.
	( dispatch, getState ) => {
		if ( waits.get( action.siteId )?.deadlineTimerId || gaveUp( getState, action.siteId ) ) {
			return;
		}

		waits.set( action.siteId, {
			...waits.get( action.siteId ),
			deadlineTimerId: setTimeout(
				() => giveUp( action.siteId, dispatch ),
				TRANSFER_POLL_DEADLINE_MS
			),
		} );
	},
];

export const receiveTransfer =
	( { siteId }, transfer ) =>
	( dispatch, getState ) => {
		const status = transfer?.status;

		if ( ! status ) {
			keepWaiting( siteId, dispatch, getState );
			return;
		}

		if ( gaveUp( getState, siteId, transfer.atomic_transfer_id ) ) {
			giveUp( siteId, dispatch, transfer );
			return;
		}

		dispatch( setAtomicTransfer( siteId, transfer ) );

		if ( settledStates.includes( status ) ) {
			stopWait( siteId );
		} else {
			schedulePoll( siteId, dispatch );
		}

		if ( status === transferStates.COMPLETED ) {
			// Update the now-atomic site to ensure plugin page displays correctly.
			dispatch( requestSite( siteId ) );
		}
	};

export const onTransferError =
	( { siteId }, error ) =>
	( dispatch, getState ) => {
		const statusCode = error?.status ?? error?.statusCode;
		const isMissingRecord =
			error?.error === 'no_transfer_record' || error?.code === 'no_transfer_record';

		if ( ( statusCode >= 400 && statusCode < 500 ) || isMissingRecord ) {
			const attempts = ( waits.get( siteId )?.missingRecordAttempts ?? 0 ) + 1;

			// The record is written moments after the purchase, so a few short retries recover the
			// common race; beyond that the client cannot tell the difference from a transfer that was
			// never started, and waiting on it is what traps the user.
			if ( isMissingRecord && attempts < MISSING_RECORD_ATTEMPTS ) {
				waits.set( siteId, { ...waits.get( siteId ), missingRecordAttempts: attempts } );
				schedulePoll( siteId, dispatch );
				return;
			}

			// The remaining 4xx cases (a failed capability check, a blog we cannot validate) say the
			// client cannot read the status, not that the transfer failed — it runs server-side either
			// way. Hence the timeout status, whose copy says the transfer may still finish, rather than
			// an error claiming it did not.
			giveUp( siteId, dispatch );
			return;
		}

		keepWaiting( siteId, dispatch, getState );
	};

registerHandlers( 'state/data-layer/wpcom/sites/atomic/transfer/index.js', {
	[ ATOMIC_TRANSFER_REQUEST ]: [
		dispatchRequest( {
			fetch: requestTransfer,
			onSuccess: receiveTransfer,
			onError: onTransferError,
		} ),
	],
} );
