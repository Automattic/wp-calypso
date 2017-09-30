/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';
import { delay, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { AUTOMATED_TRANSFER_STATUS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { requestSite } from 'state/sites/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { successNotice } from 'state/notices/actions';
import {
	getAutomatedTransferStatus,
	setAutomatedTransferStatus,
} from 'state/automated-transfer/actions';

export const requestStatus = ( { dispatch }, action ) => {
	const { siteId } = action;

	dispatch( http( {
		method: 'GET',
		path: `/sites/${ siteId }/automated-transfers/status`,
		apiVersion: '1',
	}, action ) );
};

export const receiveStatus = ( { dispatch, getState }, { siteId }, { status, uploaded_plugin_slug } ) => {
	const pluginId = uploaded_plugin_slug;

	dispatch( setAutomatedTransferStatus( siteId, status, pluginId ) );
	if ( status !== 'complete' ) {
		delay( dispatch, 3000, getAutomatedTransferStatus( siteId ) );
	}

	if ( status === 'complete' ) {
		// Update the now-atomic site to ensure plugin page displays correctly.
		dispatch( requestSite( siteId ) );
		dispatch( successNotice(
			translate( "You've successfully uploaded the %(pluginId)s plugin.", {
				args: { pluginId }
			} ),
			{ duration: 8000 }
		) );
	}
};

export default {
	[ AUTOMATED_TRANSFER_STATUS_REQUEST ]: [ dispatchRequest(
		requestStatus,
		receiveStatus,
		noop
	) ]
};
