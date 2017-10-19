/**
 * External dependencies
 *
 * @format
 */
import { delay, noop } from 'lodash';

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
} from 'state/automated-transfer/actions';
import { transferStates } from 'state/automated-transfer/constants';

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

export default {
	[ AUTOMATED_TRANSFER_STATUS_REQUEST ]: [ dispatchRequest( requestStatus, receiveStatus, noop ) ],
};
