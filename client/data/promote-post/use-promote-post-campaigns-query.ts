import { useQuery } from 'react-query';
import { requestDSP } from 'calypso/lib/promote-post';

export enum CampaignStatus {
	ALL = -1,
	TODO0 = 0,
	TODO1 = 1,
	TODO2 = 2,
}

export const AudienceListKeys = {
	topics: 'topics',
	countries: 'countries',
	devices: 'devices',
};

export type AudienceList = {
	[ key in keyof typeof AudienceListKeys ]: string;
};

export type Campaign = {
	content_config: {
		clickUrl: string;
		imageUrl: string;
		title: string;
		snippet: string;
	};
	content_image: string;
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
	impressions_estimated_total: number;
	impressions_total: number;
	delivery_percent: number;
	status: string;
	target_url: string;
	clicks_total: number;
	spent_budget_cents: number;
	deliver_margin_multiplier: number;
	audience_list: AudienceList;
	display_name: string;
	avatar_url: string;
};

const useCampaignsQuery = ( siteId: number, queryOptions = {} ) => {
	return useQuery(
		[ 'promote-post-campaigns', siteId ],
		async () => {
			const { results: campaigns } = await requestDSP< { results: Campaign[] } >(
				siteId,
				`/campaigns/site/${ siteId }/full`
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

export default useCampaignsQuery;
