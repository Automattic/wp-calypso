/** @format */

/**
 * External dependencies
 */
import { delay } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_STATUS_REQUEST } from 'client/state/action-types';
import { recordTracksEvent } from 'client/state/analytics/actions';
import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { requestSite } from 'client/state/sites/actions';
import { http } from 'client/state/data-layer/wpcom-http/actions';
import {
	fetchAutomatedTransferStatus,
	setAutomatedTransferStatus,
	automatedTransferStatusFetchingFailure,
} from 'client/state/automated-transfer/actions';
import { transferStates } from 'client/state/automated-transfer/constants';

export const requestStatus = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch(
		http(
			{
				method: 'GET',
				path: `/sites/${ siteId }/automated-transfers/status`,
				apiVersion: '1',
			},
			action
		)
	);
};

export const receiveStatus = (
	{ dispatch },
	{ siteId },
	{ status, uploaded_plugin_slug, transfer_id }
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

export const requestingStatusFailure = ( { dispatch }, { siteId } ) => {
	dispatch( automatedTransferStatusFetchingFailure( siteId ) );
};

export default {
	[ AUTOMATED_TRANSFER_STATUS_REQUEST ]: [
		dispatchRequest( requestStatus, receiveStatus, requestingStatusFailure ),
	],
};
