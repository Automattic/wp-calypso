import { useQuery } from 'react-query';
import { CampaignStats } from 'calypso/data/promote-post/use-promote-post-campaigns-query';
import { requestDSP } from 'calypso/lib/promote-post';

const useCampaignsStatsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery(
		[ 'promote-post-campaigns-stats', siteId ],
		async () => {
			const { results: campaigns } = await requestDSP< { results: CampaignStats[] } >(
				siteId,
				`/campaigns/site/${ siteId }/stats`
			);
			return campaigns;
		},
		{
			...queryOptions,
			enabled: !! siteId,
			retryDelay: 3000,
			meta: {
				persist: false,
			},
		}
	);
};

export default useCampaignsStatsQuery;
