import { pullFromStaging, pushToStaging, type StagingSyncOptions } from '@automattic/api-core';
import { mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { stagingSiteSyncStateQuery } from './site-staging-sites';

export const PUSH_TO_STAGING = 'push-to-staging-site-mutation-key';
export const PULL_FROM_STAGING = 'pull-from-staging-site-mutation-key';

export const pushToStagingMutation = ( productionSiteId: number, stagingSiteId: number ) =>
	mutationOptions( {
		mutationKey: [ PUSH_TO_STAGING, stagingSiteId ],
		mutationFn: ( options: StagingSyncOptions ) =>
			pushToStaging( productionSiteId, stagingSiteId, options ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: stagingSiteSyncStateQuery( productionSiteId ).queryKey,
			} );
		},
	} );

export const pullFromStagingMutation = ( productionSiteId: number, stagingSiteId: number ) =>
	mutationOptions( {
		mutationKey: [ PULL_FROM_STAGING, stagingSiteId ],
		mutationFn: ( options: StagingSyncOptions ) =>
			pullFromStaging( productionSiteId, stagingSiteId, options ),
		onSuccess: () => {
			queryClient.invalidateQueries( {
				queryKey: stagingSiteSyncStateQuery( productionSiteId ).queryKey,
			} );
		},
	} );
