import { useQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';

const useCampaignsQueryNew = ( siteId: number, campaignId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns', siteId, campaignId ],
		queryFn: async () => {
			//todo: check with a campaign that I do not own!!!
			const campaign = await requestDSP< { results: any[] } >(
				siteId,
				`/sites/${ siteId }/campaigns/${ campaignId }`
			);
			return campaign;
		},
		...queryOptions,
		enabled: !! campaignId && !! siteId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCampaignsQueryNew;
