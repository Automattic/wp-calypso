import { stagingSiteSyncStateQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { getProductionSiteId, isStagingSiteSyncing } from '../../utils/site-staging-site';
import type { Site, StagingSiteSyncState } from '@automattic/api-core';

/**
 * The site's staging sync state while a sync is running, or `null` otherwise.
 */
export function useRunningStagingSiteSync( site: Site ): StagingSiteSyncState | null {
	const productionSiteId = getProductionSiteId( site );
	const { data: syncState } = useQuery( {
		...stagingSiteSyncStateQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
		refetchInterval: ( query ) => ( isStagingSiteSyncing( query.state.data ) ? 5000 : false ),
		refetchIntervalInBackground: true,
	} );

	return syncState && isStagingSiteSyncing( syncState ) ? syncState : null;
}
