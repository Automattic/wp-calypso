/**
 * External dependencies
 */
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_STATUS_REQUEST } from 'state/action-types';
import { recordTracksEvent } from 'state/analytics/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { requestSite } from 'state/sites/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
	automatedTransferStatusFetchingFailure,
} from 'state/automated-transfer/actions';
import { transferStates } from 'state/automated-transfer/constants';

import { registerHandlers } from 'state/data-layer/handler-registry';

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

export const requestingStatusFailure = ( { siteId } ) => {
	return automatedTransferStatusFetchingFailure( siteId );
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
