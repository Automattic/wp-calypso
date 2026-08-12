import { ATOMIC_TRANSFER_REQUEST } from 'calypso/state/action-types';
import { fetchAtomicTransfer, setAtomicTransfer } from 'calypso/state/atomic-transfer/actions';
import { transferStates } from 'calypso/state/atomic-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSite } from 'calypso/state/sites/actions';

export const TRANSFER_POLL_DEADLINE_MS = 5 * 60 * 1000;

const POLL_INTERVAL_MS = 10000;
const MISSING_RECORD_ATTEMPTS = 6;

const settledStates = [ transferStates.COMPLETED, transferStates.ERROR, transferStates.REVERTED ];

const pollDeadlines = new Map();

const clearTimers = ( entry ) => {
	if ( entry?.timerId ) {
		clearTimeout( entry.timerId );
	}

	if ( entry?.deadlineTimerId ) {
		clearTimeout( entry.deadlineTimerId );
	}
};

const clearPollDeadline = ( siteId ) => {
	clearTimers( pollDeadlines.get( siteId ) );
	pollDeadlines.delete( siteId );
};

export const clearPollDeadlines = () => {
	for ( const siteId of [ ...pollDeadlines.keys() ] ) {
		clearPollDeadline( siteId );
	}
};

const getPollDeadline = ( siteId ) => {
	const stored = pollDeadlines.get( siteId );

	// Keep timeout state sticky for one extra deadline so duplicate fetches cannot restart the wait.
	// Clear it after that window to bound memory while allowing a later, intentional fetch to start fresh.
	if ( stored && Date.now() - stored.deadline > TRANSFER_POLL_DEADLINE_MS ) {
		clearPollDeadline( siteId );
		return undefined;
	}

	return stored;
};

const scheduleTransferPoll = ( siteId, dispatch ) => {
	const stored = pollDeadlines.get( siteId );
	if ( stored?.timerId ) {
		clearTimeout( stored.timerId );
	}

	const timerId = setTimeout( () => dispatch( fetchAtomicTransfer( siteId ) ), POLL_INTERVAL_MS );
	pollDeadlines.set( siteId, { ...stored, timerId } );
};

const setTransferTimeout = ( siteId, dispatch, transfer = {} ) => {
	const stored = pollDeadlines.get( siteId );
	clearTimers( stored );
	pollDeadlines.set( siteId, {
		...stored,
		deadline: stored?.deadline ?? Date.now(),
		hasTimedOut: true,
		timerId: undefined,
		deadlineTimerId: undefined,
	} );

	dispatch(
		setAtomicTransfer( siteId, {
			...transfer,
			status: transferStates.CLIENT_TIMEOUT,
		} )
	);
};

// The deadline is otherwise only checked when a response arrives. A request that never settles —
// a stalled connection, a tab the browser froze — produces no response at all, so without an
// absolute timer the wait would outlive its deadline in exactly the case it exists to catch.
const armDeadlineTimer = ( siteId, dispatch ) => {
	const stored = getPollDeadline( siteId );

	if ( stored?.hasTimedOut || stored?.deadlineTimerId ) {
		return;
	}

	const deadline = stored?.deadline ?? Date.now() + TRANSFER_POLL_DEADLINE_MS;
	const deadlineTimerId = setTimeout(
		() => setTransferTimeout( siteId, dispatch ),
		Math.max( 0, deadline - Date.now() )
	);

	pollDeadlines.set( siteId, { ...stored, deadline, deadlineTimerId } );
};

export const armTransferDeadline = ( siteId ) => ( dispatch ) =>
	armDeadlineTimer( siteId, dispatch );

const pollOrTimeout = ( siteId, dispatch ) => {
	const stored = getPollDeadline( siteId );
	const deadline = stored?.deadline ?? Date.now() + TRANSFER_POLL_DEADLINE_MS;

	if ( stored?.hasTimedOut || Date.now() >= deadline ) {
		setTransferTimeout( siteId, dispatch );
		return;
	}

	pollDeadlines.set( siteId, { ...stored, deadline } );
	scheduleTransferPoll( siteId, dispatch );
};

export const requestTransfer = ( action ) => [
	// Keep default exponential backoff for transient failures; onTransferError handles terminal cases.
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/transfers/latest`,
			apiVersion: '1.2',
		},
		action
	),
	armTransferDeadline( action.siteId ),
];

export const receiveTransfer =
	( { siteId }, transfer ) =>
	( dispatch ) => {
		if ( ! transfer?.status ) {
			pollOrTimeout( siteId, dispatch );
			return;
		}

		const stored = getPollDeadline( siteId );
		const transferId = transfer.atomic_transfer_id;
		const recorded =
			stored && ( stored.transferId === transferId || stored.transferId === undefined )
				? stored
				: undefined;
		const status = transfer.status;
		const isSettled = settledStates.includes( status );

		if ( recorded?.hasTimedOut && ! isSettled ) {
			setTransferTimeout( siteId, dispatch, transfer );
			return;
		}

		dispatch( setAtomicTransfer( siteId, transfer ) );

		if ( isSettled ) {
			clearPollDeadline( siteId );
		} else {
			if ( ! recorded ) {
				// A different transfer is under way: drop the previous wait's deadline, timers and
				// timeout flag instead of inheriting them.
				clearPollDeadline( siteId );
			}

			const deadline = recorded?.deadline ?? Date.now() + TRANSFER_POLL_DEADLINE_MS;

			if ( Date.now() < deadline ) {
				pollDeadlines.set( siteId, { ...pollDeadlines.get( siteId ), transferId, deadline } );
				scheduleTransferPoll( siteId, dispatch );
			} else {
				pollDeadlines.set( siteId, { ...pollDeadlines.get( siteId ), transferId, deadline } );
				setTransferTimeout( siteId, dispatch, transfer );
			}
		}

		if ( status === transferStates.COMPLETED ) {
			// Update the now-atomic site to ensure plugin page displays correctly.
			dispatch( requestSite( siteId ) );
		}
	};

export const onTransferError =
	( { siteId }, error ) =>
	( dispatch ) => {
		const statusCode = error?.status ?? error?.statusCode;
		const isMissingRecord =
			error?.error === 'no_transfer_record' || error?.code === 'no_transfer_record';

		if ( ( statusCode >= 400 && statusCode < 500 ) || isMissingRecord ) {
			if ( isMissingRecord ) {
				const stored = getPollDeadline( siteId );
				const missingRecordAttempts = ( stored?.missingRecordAttempts ?? 0 ) + 1;

				// The record is written moments after the purchase, so a few short retries recover the
				// common race; beyond that the client cannot tell the difference from a transfer that
				// was never started, and waiting on it is what traps the user.
				if ( missingRecordAttempts < MISSING_RECORD_ATTEMPTS ) {
					const deadline = stored?.deadline ?? Date.now() + TRANSFER_POLL_DEADLINE_MS;
					pollDeadlines.set( siteId, { ...stored, deadline, missingRecordAttempts } );
					scheduleTransferPoll( siteId, dispatch );
					return;
				}
			}

			setTransferTimeout( siteId, dispatch );
			return;
		}

		pollOrTimeout( siteId, dispatch );
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
