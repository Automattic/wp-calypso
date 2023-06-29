import { useQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';
import { Campaign } from './types';

export enum CampaignStatus {
	ALL = -1,
	TODO0 = 0,
	TODO1 = 1,
	TODO2 = 2,
}

const useCampaignsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns', siteId ],
		queryFn: async () => {
			const { results: campaigns } = await requestDSP< { results: Campaign[] } >(
				siteId,
				`/campaigns/site/${ siteId }/summary`
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

export default useCampaignsQuery;
