import { useQuery } from '@tanstack/react-query';
import { CampaignObjectiveQueryResult } from 'calypso/data/promote-post/types';
import { requestDSP } from 'calypso/lib/promote-post';

const usePromotePostCampaignsStatsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaign-objectives', siteId ],
		queryFn: async () => {
			if ( siteId ) {
				const { objectives } = await requestDSP< { objectives: CampaignObjectiveQueryResult } >(
					siteId,
					`/campaigns/objectives`,
					'GET',
					'v1.1'
				);

				return objectives;
			}
			throw new Error( 'siteId is undefined' );
		},
		...queryOptions,
		enabled: !! siteId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
		staleTime: 1000 * 60 * 60 * 12, // Cache data for 12 hours
		refetchOnWindowFocus: false,
	} );
};

export default usePromotePostCampaignsStatsQuery;
