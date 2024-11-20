import { useQuery } from '@tanstack/react-query';
import { requestDSPHandleErrors } from 'calypso/lib/promote-post';

export type CampaignChartSeriesData = {
	date_utc: string; // ISO date string
	total: number;
};
export type CampaignChartCountryData = {
	country: string;
	total: number;
	percentage: number;
};
export type CampaignChartStatsResponse = {
	filters: {
		campaign_id: string;
		period: {
			start: string; // ISO date string
			end: string; // ISO date string
		};
	};
	series: {
		impressions: CampaignChartSeriesData[];
		clicks: CampaignChartSeriesData[];
		spend: CampaignChartSeriesData[];
	};
	total_stats: {
		total: {
			impressions: number;
			clicks: number;
			spend: number;
		};
		countryStats: {
			clicks: CampaignChartCountryData[];
			impressions: CampaignChartCountryData[];
			spend: CampaignChartCountryData[];
		};
	};
};
export const useCampaignChartStatsQuery = (
	siteId: number,
	campaignId: number,
	startDate: string
) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaign-stats', siteId, campaignId, startDate ],
		queryFn: async () => {
			return await requestDSPHandleErrors< CampaignChartStatsResponse >(
				siteId,
				`/stats/${ campaignId }`,
				'GET',
				{
					tz: 'UTC',
					start_date: startDate,
				},
				'1.1'
			);
		},
		enabled: !! siteId && !! campaignId && !! startDate,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};
