import { useQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';

export type CampaignResponse = {
	audience_list: {
		devices: string;
		countries: string;
		topics: string;
		OSs: string;
	};
	content_config: {
		clickUrl: string;
		title: string;
	};
	display_delivery_estimate: string;
	campaign_id: number;
	start_date: string;
	end_date: string;
	display_name: string;
	creative_html: string;
	width: number;
	height: number;
	status: string;
	target_urn: string;
	delivery_percent: number;
	campaign_stats: {
		impressions_total: number;
		clicks_total: number;
		clickthrough_rate: number;
		duration_days: number;
		total_budget: number;
		total_budget_left: number;
		overall_spending: number;
		display_delivery_estimate: string;
		visits_total: number;
		visits_organic: number;
		visits_organic_rate: number;
		visits_ad_rate: number;
	};
	billing_data: {
		payment_method: string;
		subtotal: number;
		credits: number;
		currency: string;
		total: number;
		card_name: string;
	};
};

const useCampaignsQueryNew = ( siteId: number, campaignId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns', siteId, campaignId ],
		queryFn: async () => {
			const campaign = await requestDSP< CampaignResponse >(
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
