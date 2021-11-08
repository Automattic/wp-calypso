import { delay } from 'lodash';
import {
	AUTOMATED_TRANSFER_STATUS_REQUEST,
	AUTOMATED_TRANSFER_STATUS_REQUEST_ONCE,
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
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

export const requestStatus = ( action ) =>
	http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/automated-transfers/status`,
			apiVersion: '1',
		},
		action
	);

export const receiveStatus = ( { siteId }, { status, uploaded_plugin_slug, transfer_id } ) => (
	dispatch
) => {
	const pluginId = uploaded_plugin_slug;

	dispatch( setAutomatedTransferStatus( siteId, status, pluginId ) );
	if ( status !== transferStates.ERROR && status !== transferStates.COMPLETE ) {
		delay( dispatch, 3000, fetchAutomatedTransferStatus( siteId ) );
	}

	if ( status === transferStates.COMPLETE ) {
		dispatch(
			recordTracksEvent( 'calypso_automated_transfer_complete', {
				context: 'plugin_upload',
				transfer_id,
				uploaded_plugin_slug,
			} )
		);

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
	[ AUTOMATED_TRANSFER_STATUS_REQUEST_ONCE ]: [
		dispatchRequest( {
			fetch: requestStatus,
			onSuccess: receiveStatusOnce,
			onError: requestingStatusFailure,
		} ),
	],
} );

export function receiveStatusOnce( { siteId }, { status, uploaded_plugin_slug } ) {
	return ( dispatch ) => {
		dispatch( setAutomatedTransferStatus( siteId, status, uploaded_plugin_slug ) );

		// Prevent scenarios where isAtomic is false while transferStatus is complete.
		dispatch( requestSite( siteId ) );
	};
}
