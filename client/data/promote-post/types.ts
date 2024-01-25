export enum CampaignStatus {
	'created',
	'active',
	'canceled',
	'finished',
}

export type AudienceList = {
	devices: string;
	cities: string;
	states: string;
	regions: string;
	countries: string;
	topics: string;
	languages: string;
};

export type Campaign = {
	content_config: {
		clickUrl: string;
		imageUrl: string;
		title: string;
		snippet: string;
	};
	content_image: string;
	created_at: string;
	start_date: string; // "2022-07-18T01:51:12.000Z"
	end_date: string;
	status_smart: CampaignStatus;
	target_urns: string;
	width: number;
	height: number;
	name: string;
	campaign_id: number;
	budget_cents: number;
	moderation_reason: string;
	moderation_status: number | null;
	type: string;
	display_delivery_estimate: string;
	delivery_percent: number;
	status: string;
	ui_status: string;
	target_url: string;
	deliver_margin_multiplier: number;
	audience_list: AudienceList;
	display_name: string;
	avatar_url: string;
	creative_html: string;
	campaign_stats_loading: boolean;
	campaign_stats?: CampaignStats;
};

export type CampaignStats = {
	campaign_id: number;
	impressions_total: number;
	clicks_total: number;
	spent_budget_cents: number;
	deliver_margin_multiplier: number;
};

export type BlazablePost = {
	ID: number;
	author: string;
	date: string;
	date_gtm?: string;
	modified: string;
	modified_gmt?: string;
	status?: string;
	guid?: string;
	title: string;
	type: string;
	comment_count: number;
	like_count: number;
	monthly_view_count: number;
	post_url: string;
	featured_image: string | false;
	post_thumbnail?: string;
	sku?: string;
	price?: string;
};

export type BlazePagedItem = BlazablePost | Campaign;

export type PostQueryResult = {
	posts?: BlazablePost[];
	has_more_pages: boolean;
	total_items: number;
	total_pages: number;
	page: number;
	pages: [];
	pageParams: [];
};

export type CampaignQueryResult = {
	campaigns: Campaign[];
	total_items: number;
	total_pages: number;
	page: number;
	has_more_pages: boolean;
};
