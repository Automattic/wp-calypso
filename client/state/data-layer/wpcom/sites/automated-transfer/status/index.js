import { AUTOMATED_TRANSFER_STATUS_REQUEST } from 'calypso/state/action-types';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
	automatedTransferStatusFetchingFailure,
} from 'calypso/state/automated-transfer/actions';
import {
	NO_TRANSFER_RECORD_ERROR,
	transferSettledStates,
	transferStates,
} from 'calypso/state/automated-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSite } from 'calypso/state/sites/actions';

export const TRANSFER_STATUS_POLL_DEADLINE_MS = 5 * 60 * 1000;

const POLL_INTERVAL_MS = 3000;

// A missing transfer record right after a purchase can mean the backend simply hasn't created
// it yet, so it deserves a few retries — but it is also the terminal answer for a site that
// has no transfer at all, so it must not be retried for the full deadline window.
export const MISSING_RECORD_ATTEMPTS = 6;

// The deadline belongs to the wait, not to a single request: consumers re-dispatch a fetch
// every time the status changes, and each of those would otherwise open a fresh window. It
// is held here rather than carried on the action so a poll scheduled by a wait that has
// since ended cannot apply its expired deadline to whatever is running now.
const pollDeadlines = new Map();

export const clearPollDeadlines = () => pollDeadlines.clear();

const getOrCreatePollDeadline = ( siteId ) => {
	const stored = pollDeadlines.get( siteId );
	if ( stored ) {
		return stored;
	}

	const created = { deadline: Date.now() + TRANSFER_STATUS_POLL_DEADLINE_MS };
	pollDeadlines.set( siteId, created );
	return created;
};

export const requestStatus = ( action ) => {
	// Only an explicit new wait touches the deadline state. Plain and 'single' fetches would
	// orphan an entry (handing a later wait an already-expired window), and a 'continue' poll
	// minting one could resurrect a wait that has already settled.
	if ( action.pollingMode === 'start' ) {
		pollDeadlines.delete( action.siteId );
		getOrCreatePollDeadline( action.siteId );
	}
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/automated-transfers/status`,
			apiVersion: '1',
		},
		action
	);
};

export const receiveStatus =
	( { siteId, pollingMode }, { status, uploaded_plugin_slug, transfer_id: transferId } ) =>
	( dispatch ) => {
		const pluginId = uploaded_plugin_slug;
		const isSettled = transferSettledStates.includes( status );
		const stored = pollDeadlines.get( siteId );
		const recorded =
			stored?.transferId === undefined || stored?.transferId === transferId ? stored : undefined;

		// Once a wait has run out of time it stays that way until the transfer actually ends.
		// Otherwise the next status fetch — and several screens keep fetching — would replace
		// the error with a spinner and start the five minutes over, indefinitely.
		if ( recorded?.hasTimedOut && ! isSettled ) {
			dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, pluginId ) );
			return;
		}

		dispatch( setAutomatedTransferStatus( siteId, status, pluginId ) );

		if ( pollingMode === 'single' ) {
			// Inert with respect to the deadline state, and no polling chain of its own.
		} else if ( isSettled ) {
			pollDeadlines.delete( siteId );
		} else {
			const deadline = recorded?.deadline ?? Date.now() + TRANSFER_STATUS_POLL_DEADLINE_MS;

			if ( Date.now() < deadline ) {
				pollDeadlines.set( siteId, { transferId, deadline } );
				// The wait's polling mode travels on the chain's own actions rather than on the
				// shared deadline entry — a concurrent fetch from another surface must not inherit
				// it, and a transfer_id change must not drop it.
				setTimeout(
					dispatch,
					POLL_INTERVAL_MS,
					fetchAutomatedTransferStatus( siteId, pollingMode ? 'continue' : null )
				);
			} else {
				pollDeadlines.set( siteId, { transferId, deadline, hasTimedOut: true } );
				dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, pluginId ) );
			}
		}

		if ( status === transferStates.COMPLETE || status === transferStates.COMPLETED ) {
			// Update the now-atomic site to ensure plugin page displays correctly.
			dispatch( requestSite( siteId ) );
		}
	};

export const requestingStatusFailure = ( response ) => ( dispatch ) => {
	const { siteId, pollingMode } = response;
	const message = response.meta?.dataLayer?.error?.message;
	dispatch( automatedTransferStatusFetchingFailure( { siteId, error: message } ) );

	// Retrying failures — and eventually reporting CLIENT_TIMEOUT — is behavior only waits
	// get. Plain and 'single' fetches fail once and stop, exactly as they always did.
	if ( pollingMode !== 'start' && pollingMode !== 'continue' ) {
		return;
	}

	// No entry means the wait has ended (a settled response deletes it) or never started.
	// A stale failure must not resurrect it — the mode on the action alone is not proof
	// the wait is still alive.
	const recorded = pollDeadlines.get( siteId );
	if ( ! recorded ) {
		return;
	}

	const retryFetch = fetchAutomatedTransferStatus( siteId, 'continue' );

	// The reducer maps a missing record to the terminal NONE status, so once the retries run
	// out the chain must end there — letting the deadline fire would replace a real "this site
	// has no transfer" answer with a timeout.
	if ( message === NO_TRANSFER_RECORD_ERROR ) {
		const missingRecordAttempts = ( recorded.missingRecordAttempts ?? 0 ) + 1;
		if ( missingRecordAttempts >= MISSING_RECORD_ATTEMPTS ) {
			pollDeadlines.delete( siteId );
			return;
		}

		pollDeadlines.set( siteId, { ...recorded, missingRecordAttempts } );
		setTimeout( dispatch, POLL_INTERVAL_MS, retryFetch );
		return;
	}

	if ( Date.now() < recorded.deadline ) {
		setTimeout( dispatch, POLL_INTERVAL_MS, retryFetch );
		return;
	}

	pollDeadlines.set( siteId, { ...recorded, hasTimedOut: true } );
	dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/automated-transfer/status/index.js', {
	[ AUTOMATED_TRANSFER_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestStatus,
			onSuccess: receiveStatus,
			onError: requestingStatusFailure,
		} ),
	],
} );
