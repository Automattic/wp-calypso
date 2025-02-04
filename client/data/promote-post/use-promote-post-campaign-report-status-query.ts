import { useQuery } from '@tanstack/react-query';
import { requestDSP } from 'calypso/lib/promote-post';

const useCampaignReportStatusQuery = (
	siteId: number,
	campaignId: number,
	reportId: string,
	shouldFetchReportStatus: boolean,
	queryOptions = {}
) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaign-report-status', siteId, campaignId, reportId ],
		queryFn: async () => {
			const results = await requestDSP< {
				retry: boolean;
				status: string;
			} >( siteId, `/stats/${ campaignId }/report/${ reportId }/status`, 'GET', undefined, '1.1' );
			return results;
		},
		...queryOptions,
		enabled: !! siteId && !! campaignId && !! reportId && shouldFetchReportStatus,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCampaignReportStatusQuery;
