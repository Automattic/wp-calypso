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

export enum ChartResolution {
	Hour = 'hour',
	Day = 'day',
}

export const useCampaignChartStatsQuery = (
	siteId: number,
	campaignId: number,
	chartParams: { startDate: string; endDate: string; resolution: ChartResolution },
	hasStats: boolean
) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaign-stats', siteId, campaignId, chartParams ],
		queryFn: async () => {
			return await requestDSPHandleErrors< CampaignChartStatsResponse >(
				siteId,
				`/stats/${ campaignId }`,
				'GET',
				{
					tz: Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone ?? 'UTC',
					start_date: chartParams.startDate,
					end_date: chartParams.endDate,
					resolution: chartParams.resolution,
				},
				'1.1'
			);
		},
		enabled: !! siteId && !! campaignId && !! chartParams.startDate && hasStats,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};
