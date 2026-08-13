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
	// A single recovery check must not touch the deadline state: a regular chain may be
	// running for the same site, and deleting or reviving its entry would either kill its
	// timeout or let it mint a fresh five-minute window.
	if ( ! action.singleCheck ) {
		if ( action.resetPolling ) {
			pollDeadlines.delete( action.siteId );
		}
		const recorded = getOrCreatePollDeadline( action.siteId );
		if ( action.retryOnFailure && ! recorded.retryOnFailure ) {
			pollDeadlines.set( action.siteId, { ...recorded, retryOnFailure: true } );
		}
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
	( { siteId, singleCheck }, { status, uploaded_plugin_slug, transfer_id: transferId } ) =>
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

		if ( singleCheck ) {
			// Inert with respect to the deadline state, and no polling chain of its own.
		} else if ( isSettled ) {
			pollDeadlines.delete( siteId );
		} else {
			const deadline = recorded?.deadline ?? Date.now() + TRANSFER_STATUS_POLL_DEADLINE_MS;
			const retryOnFailure = recorded?.retryOnFailure;

			if ( Date.now() < deadline ) {
				pollDeadlines.set( siteId, { transferId, deadline, retryOnFailure } );
				setTimeout( dispatch, POLL_INTERVAL_MS, fetchAutomatedTransferStatus( siteId ) );
			} else {
				pollDeadlines.set( siteId, { transferId, deadline, retryOnFailure, hasTimedOut: true } );
				dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, pluginId ) );
			}
		}

		if ( status === transferStates.COMPLETE || status === transferStates.COMPLETED ) {
			// Update the now-atomic site to ensure plugin page displays correctly.
			dispatch( requestSite( siteId ) );
		}
	};

export const requestingStatusFailure = ( response ) => ( dispatch ) => {
	const { siteId } = response;
	const message = response.meta?.dataLayer?.error?.message;
	dispatch( automatedTransferStatusFetchingFailure( { siteId, error: message } ) );

	if ( response.singleCheck ) {
		return;
	}

	// Retrying failures — and eventually reporting CLIENT_TIMEOUT — is behavior only waits
	// that asked for it should get. Other dispatchers of this action expect a failed request
	// to fail once and stop, exactly as it did before the retry logic existed.
	const recorded = pollDeadlines.get( siteId );
	if ( ! recorded?.retryOnFailure ) {
		return;
	}

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
		setTimeout( dispatch, POLL_INTERVAL_MS, fetchAutomatedTransferStatus( siteId ) );
		return;
	}

	if ( Date.now() < recorded.deadline ) {
		setTimeout( dispatch, POLL_INTERVAL_MS, fetchAutomatedTransferStatus( siteId ) );
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
