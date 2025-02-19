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
	display_clicks_estimate: string;
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
		tsp?: {
			impressions_total: number;
			clicks_total: number;
			permalink: string;
			likes_total: number;
			replies_total: number;
			replies?: {
				blog_name: string;
				blog_url: string;
				reply_text?: string;
			}[];
		};
	};
	billing_data: {
		payment_method: string;
		subtotal: number;
		credits: number;
		currency: string;
		total: number;
		card_name: string;
		orders: Order[];
		debt_amount?: number;
		payment_links?: {
			date: string;
			amount: number;
			url: string;
		}[];
	};
	is_evergreen?: boolean;
	objective?: string;
	objective_data?: {
		title: string;
		description: string;
		suitable_for_description: string;
	};
};

export type Order = {
	id: number;
	orderKey: string;
	userId: number;
	customerId: number;
	status: 'COMPLETED' | 'PENDING' | 'FAILED' | string;
	currency: string;
	total: string;
	totalTax: string;
	paymentMethod: string;
	failedPaymentCounter: number;
	paymentMethodTitle: string;
	dateCreatedGmt: string;
	dateModifiedGmt: string;
	dateCompletedGmt: string;
	datePaidGmt: string;
	createdAt: string;
	updatedAt: string;
	lineItems: LineItem[];
	feeItems: FeeItem[];
	credits: number;
	subtotal: number;
};

type LineItem = {
	id: number;
	orderId: number;
	campaignId: number;
	name: string;
	subtotal: string;
	total: string;
};

type FeeItem = {
	id: number;
	orderId: number;
	name: string;
	total: string;
};

export const useCampaignsQuery = ( siteId: number, campaignId: number, queryOptions = {} ) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaigns', siteId, campaignId ],
		queryFn: async () => {
			return await requestDSPHandleErrors< CampaignResponse >(
				siteId,
				`/sites/${ siteId }/campaigns/${ campaignId }`
			);
		},
		...queryOptions,
		enabled: !! campaignId && !! siteId,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};
