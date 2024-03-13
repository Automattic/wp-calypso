import { useQuery } from '@tanstack/react-query';
import { requestDSPHandleErrors } from 'calypso/lib/promote-post';
import { AudienceList } from './types';

export type CampaignResponse = {
	audience_list: AudienceList;
	content_config: {
		clickUrl: string;
		title: string;
	};
	display_delivery_estimate: string;
	campaign_id: number;
	start_date: string;
	created_at: string;
	end_date: string;
	display_name: string;
	creative_html: string;
	width: number;
	height: number;
	status: string;
	ui_status: string;
	target_urn: string;
	delivery_percent: number;
	format: string;
	budget_cents: number;
	type: string;
	campaign_stats: {
		impressions_total: number;
		clicks_total: number;
		clickthrough_rate: number;
		duration_days: number;
		total_budget: number;
		budget_left: number;
		total_budget_used: number;
		display_delivery_estimate: string;
		views_total: number;
		stats_enabled: boolean;
		views_organic: number;
		views_organic_rate: number;
		views_ad_rate: number;
		conversions_total?: number;
		conversion_rate?: number;
		conversion_value?: Record< string, number >;
		conversion_last_currency_found?: string;
	};
	billing_data: {
		payment_method: string;
		subtotal: number;
		credits: number;
		currency: string;
		total: number;
		card_name: string;
		orders: Order[];
	};
	is_evergreen?: boolean;
};

export type Order = {
	order_id: number;
	order_key: string;
	customer_id: number;
	status: string;
	currency: string;
	total: string;
	total_tax: string;
	payment_method: string;
	failed_payment_counter: number;
	payment_method_title: string;
	date_created_gmt: string | null;
	date_modified_gmt: string | null;
	date_completed_gmt: string | null;
	date_paid_gmt: string | null;
	created_at: string;
	updated_at: string;
	user_id: number;
};

const useCampaignsQuery = ( siteId: number, campaignId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns', siteId, campaignId ],
		queryFn: async () => {
			const campaign = await requestDSPHandleErrors< CampaignResponse >(
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

export default useCampaignsQuery;
