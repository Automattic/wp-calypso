import { SITE_SYNC_STATUS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { requestSite } from 'calypso/state/sites/actions';
import {
	setSiteSyncStatus,
	siteSyncStatusFetchingFailure,
	setSyncingTargetSite,
	setSyncingSourceSite,
	setSiteSyncRestoreId,
} from 'calypso/state/sync/actions';
import { SiteSyncStatus } from 'calypso/state/sync/constants';

export const requestStatus = ( action ) => {
	if ( ! action.siteId ) {
		return {};
	}
	return http(
		{
			method: 'GET',
			path: `/sites/${ action.siteId }/staging-site/sync-state`,
			apiNamespace: 'wpcom/v2',
		},
		action
	);
};
export const receiveStatus =
	( { siteId }, { status, restore_id, direction } ) =>
	( dispatch ) => {
		dispatch( setSiteSyncStatus( siteId, status ) );
		dispatch( setSiteSyncRestoreId( siteId, restore_id ) );
		if ( direction === 'pull' ) {
			dispatch( setSyncingTargetSite( siteId, 'production' ) );
			dispatch( setSyncingSourceSite( siteId, 'staging' ) );
		}
		if ( direction === 'push' ) {
			dispatch( setSyncingTargetSite( siteId, 'staging' ) );
			dispatch( setSyncingSourceSite( siteId, 'production' ) );
		}
		if ( status === SiteSyncStatus.COMPLETED ) {
			// Update the site object to reflect the new status
			dispatch( requestSite( siteId ) );
		}
	};

export const requestingStatusFailure = ( response ) => {
	return siteSyncStatusFetchingFailure( {
		siteId: response.siteId,
		error: response.meta?.dataLayer?.error?.message,
	} );
};

registerHandlers( 'state/data-layer/wpcom/sites/sync/status/index.js', {
	[ SITE_SYNC_STATUS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestStatus,
			onSuccess: receiveStatus,
			onError: requestingStatusFailure,
		} ),
	],
} );
