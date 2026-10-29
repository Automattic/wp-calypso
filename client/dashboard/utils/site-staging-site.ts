import type { Site, StagingSiteSyncState } from '@automattic/api-core';

export const getProductionSiteId = ( site: Site ) =>
	! site.is_wpcom_staging_site ? site.ID : site.options?.wpcom_production_blog_id;

export const getStagingSiteId = ( site: Site ) =>
	site.is_wpcom_staging_site ? site.ID : site.options?.wpcom_staging_blog_ids?.[ 0 ];

export const hasProductionSite = ( site: Site ) => !! getProductionSiteId( site );

export const hasStagingSite = ( site: Site ) => !! getStagingSiteId( site );

export const isStagingSiteSyncing = ( stagingSiteSyncState?: StagingSiteSyncState ) => {
	return (
		stagingSiteSyncState &&
		[ 'pending', 'backing_up', 'restoring' ].includes( stagingSiteSyncState.status )
	);
};

export const hasStagingSiteSyncFailed = ( stagingSiteSyncState?: StagingSiteSyncState ) => {
	return (
		!! stagingSiteSyncState && [ 'failed', 'allow_retry' ].includes( stagingSiteSyncState.status )
	);
};

export const STAGING_SITE_SYNC_TIMEOUT_MS = 2 * 60 * 60 * 1000;

export const hasStagingSiteSyncTimedOut = ( stagingSiteSyncState?: StagingSiteSyncState ) => {
	return (
		!! stagingSiteSyncState?.started_at &&
		Date.now() - stagingSiteSyncState.started_at * 1000 > STAGING_SITE_SYNC_TIMEOUT_MS
	);
};
