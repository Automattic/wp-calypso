import type { Site, StagingSiteSyncState } from '../data/types';

export const getProductionSiteId = ( site: Site ) =>
	! site.is_wpcom_staging_site ? site.ID : site.options?.wpcom_production_blog_id;

export const getStagingSiteId = ( site: Site ) =>
	site.is_wpcom_staging_site ? site.ID : site.options?.wpcom_staging_blog_ids?.[ 0 ];

export const hasProductionSite = ( site: Site ) => !! getProductionSiteId( site );

export const hasStagingSite = ( site: Site ) => !! getStagingSiteId( site );

export const isStagingSiteSyncing = ( stagingSiteSyncState?: StagingSiteSyncState ) => {
	return (
		stagingSiteSyncState &&
		! [ 'completed', 'allow_retry', 'failed' ].includes( stagingSiteSyncState.status )
	);
};
