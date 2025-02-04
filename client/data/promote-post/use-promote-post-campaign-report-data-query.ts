import { useQuery } from '@tanstack/react-query';
import { requestDSPHandleErrors } from 'calypso/lib/promote-post';

const useCampaignReportDataQuery = (
	siteId: number,
	campaignId: number,
	reportId: string,
	shouldFetchReportData: boolean,
	queryOptions = {}
) => {
	return useQuery( {
		queryKey: [ 'promote-post-campaign-report-data', siteId, campaignId, reportId ],
		queryFn: async () => {
			const response = await requestDSPHandleErrors< string >(
				siteId,
				`/stats/${ campaignId }/report/${ reportId }`,
				'GET',
				undefined,
				'1.1'
			);
			return response;
		},
		...queryOptions,
		enabled: !! siteId && !! campaignId && !! reportId && shouldFetchReportData,
		retryDelay: 3000,
		meta: {
			persist: false,
		},
	} );
};

export default useCampaignReportDataQuery;
