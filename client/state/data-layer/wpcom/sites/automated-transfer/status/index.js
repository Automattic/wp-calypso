import { AUTOMATED_TRANSFER_STATUS_REQUEST } from 'calypso/state/action-types';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
	automatedTransferStatusFetchingFailure,
} from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSite } from 'calypso/state/sites/actions';

export const TRANSFER_STATUS_POLL_DEADLINE_MS = 5 * 60 * 1000;

const POLL_INTERVAL_MS = 3000;

// Statuses the backend will not move away from on its own. Polling past one of these would
// keep asking about a transfer that has already ended, and letting the deadline fire on one
// would overwrite a real outcome with a generic timeout.
const settledStates = [
	transferStates.COMPLETE,
	transferStates.COMPLETED,
	transferStates.ERROR,
	transferStates.FAILURE,
	transferStates.CONFLICTS,
	transferStates.REVERTED,
];

// The deadline belongs to the wait, not to a single request: consumers re-dispatch a fetch
// every time the status changes, and each of those would otherwise open a fresh window. It
// is held here rather than carried on the action so a poll scheduled by a wait that has
// since ended cannot apply its expired deadline to whatever is running now.
const pollDeadlines = new Map();

export const clearPollDeadlines = () => pollDeadlines.clear();

export const requestStatus = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/automated-transfers/status`,
			apiVersion: '1',
		},
		action
	);

export const receiveStatus =
	( { siteId }, { status, uploaded_plugin_slug, transfer_id: transferId } ) =>
	( dispatch ) => {
		const pluginId = uploaded_plugin_slug;
		const isSettled = settledStates.includes( status );
		const stored = pollDeadlines.get( siteId );
		const recorded = stored?.transferId === transferId ? stored : undefined;

		// Once a wait has run out of time it stays that way until the transfer actually ends.
		// Otherwise the next status fetch — and several screens keep fetching — would replace
		// the error with a spinner and start the five minutes over, indefinitely.
		if ( recorded?.hasTimedOut && ! isSettled ) {
			dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, pluginId ) );
			return;
		}

		dispatch( setAutomatedTransferStatus( siteId, status, pluginId ) );

		if ( isSettled ) {
			pollDeadlines.delete( siteId );
		} else {
			const deadline = recorded?.deadline ?? Date.now() + TRANSFER_STATUS_POLL_DEADLINE_MS;

			if ( Date.now() < deadline ) {
				pollDeadlines.set( siteId, { transferId, deadline } );
				setTimeout( dispatch, POLL_INTERVAL_MS, fetchAutomatedTransferStatus( siteId ) );
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

export const requestingStatusFailure = ( response ) => {
	return automatedTransferStatusFetchingFailure( {
		siteId: response.siteId,
		error: response.meta?.dataLayer?.error?.message,
	} );
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
