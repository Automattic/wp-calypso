import { useQuery } from '@tanstack/react-query';
import { CampaignStats } from 'calypso/data/promote-post/types';
import { requestDSP } from 'calypso/lib/promote-post';

const useCampaignsStatsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns-stats', siteId ],
		queryFn: async () => {
			const { results: campaigns } = await requestDSP< { results: CampaignStats[] } >(
				siteId,
				`/campaigns/site/${ siteId }/stats`
			);
			return campaigns;
		},
		...queryOptions,
		enabled: !! siteId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCampaignsStatsQuery;
