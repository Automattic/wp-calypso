import { stagingSiteSyncStateQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import {
	getProductionSiteId,
	hasStagingSiteSyncFailed,
	isStagingSiteSyncing,
} from '../../utils/site-staging-site';
import type { Site, StagingSiteSyncState } from '@automattic/api-core';

const FAILED_SYNC_NOTICE_FOR_MS = 24 * 60 * 60 * 1000;

/**
 * The site's staging sync state while a sync is running or for a day after one fails, or `null` otherwise.
 */
export function useStagingSiteSyncForNotice( site: Site ): StagingSiteSyncState | null {
	const productionSiteId = getProductionSiteId( site );
	const { data: syncState } = useQuery( {
		...stagingSiteSyncStateQuery( productionSiteId ?? 0 ),
		enabled: !! productionSiteId,
		refetchInterval: ( query ) => ( isStagingSiteSyncing( query.state.data ) ? 5000 : false ),
		refetchIntervalInBackground: true,
	} );

	if ( ! syncState ) {
		return null;
	}

	if ( isStagingSiteSyncing( syncState ) ) {
		return syncState;
	}

	if (
		hasStagingSiteSyncFailed( syncState ) &&
		Date.now() - syncState.started_at * 1000 < FAILED_SYNC_NOTICE_FOR_MS
	) {
		return syncState;
	}

	return null;
}
