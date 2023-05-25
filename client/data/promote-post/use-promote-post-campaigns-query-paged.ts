import { useInfiniteQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';
import { SearchOptions } from 'calypso/my-sites/promote-post-i2/components/search-bar';

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
	OSs: 'OSs',
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
	display_delivery_estimate: string;
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
	creative_html: string;
	campaign_stats_loading: boolean;
};

export type CampaignStats = {
	campaign_id: number;
	display_delivery_estimate: string;
	impressions_total: number;
	delivery_percent: number;
	target_url: string;
	clicks_total: number;
	spent_budget_cents: number;
	deliver_margin_multiplier: number;
};

type CampaignQueryResult = {
	campaigns: Campaign[];
	total_items: number;
	total_pages: number;
	page: number;
};

type CampaignQueryOptions = {
	page?: number;
};

const getSearchOptionsQueryParams = ( searchOptions: SearchOptions ) => {
	let searchQueryParams = '';

	if ( searchOptions.search ) {
		searchQueryParams += `&title=${ searchOptions.search }`;
	}
	if ( searchOptions.filter ) {
		if ( searchOptions.filter.status && searchOptions.filter.status !== 'all' ) {
			searchQueryParams += `&status=${ searchOptions.filter.status }`;
		}
	}

	return searchQueryParams;
};

const useCampaignsQueryPaged = (
	siteId: number,
	searchOptions: SearchOptions,
	queryOptions: CampaignQueryOptions = {}
) => {
	const searchQueryParams = getSearchOptionsQueryParams( searchOptions );

	return useInfiniteQuery(
		[ 'promote-post-campaigns', siteId, searchQueryParams ],
		async ( { pageParam = 1 } ) => {
			const resultQuery = await requestDSP< CampaignQueryResult >(
				siteId,
				`/search/campaigns?order=asc&order_by=post_date&page=${ pageParam }&site_id=${ siteId }&${ searchQueryParams }`
			);

			const { campaigns, page, total_items, total_pages } = resultQuery;
			const has_more_pages = page < total_pages;

			return {
				campaigns,
				has_more_pages,
				total_items,
				total_pages,
				page,
			};
		},
		{
			...queryOptions,
			enabled: !! siteId,
			retryDelay: 3000,
			keepPreviousData: true,
			refetchOnWindowFocus: false,
			meta: {
				persist: false,
			},
			getNextPageParam: ( lastPage ) => {
				if ( lastPage.has_more_pages ) {
					return lastPage.page + 1;
				}
				return undefined;
			},
		}
	);
};

export default useCampaignsQueryPaged;
