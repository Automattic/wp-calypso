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
	( { siteId, pollDeadline }, { status, uploaded_plugin_slug } ) =>
	( dispatch ) => {
		const pluginId = uploaded_plugin_slug;

		dispatch( setAutomatedTransferStatus( siteId, status, pluginId ) );
		if ( status !== transferStates.ERROR && status !== transferStates.COMPLETE ) {
			const deadline = pollDeadline ?? Date.now() + TRANSFER_STATUS_POLL_DEADLINE_MS;
			if ( Date.now() < deadline ) {
				setTimeout( dispatch, 3000, fetchAutomatedTransferStatus( siteId, deadline ) );
			} else {
				dispatch( setAutomatedTransferStatus( siteId, transferStates.CLIENT_TIMEOUT, pluginId ) );
			}
		}

		if ( status === transferStates.COMPLETE ) {
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
