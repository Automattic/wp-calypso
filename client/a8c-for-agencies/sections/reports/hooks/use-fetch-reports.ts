import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Report } from '../types';

// // Mock data for demonstration
const mockReportsData: Report[] = [
	{
		id: 'rpt_1',
		site: 'example.com',
		status: 'sent',
		createdAt: '2024-01-01T09:00:00Z',
	},
	{
		id: 'rpt_2',
		site: 'mybusiness.com',
		status: 'sent',
		createdAt: '2024-01-02T09:00:00Z',
	},
	{
		id: 'rpt_3',
		site: 'example.com',
		status: 'error',
		createdAt: '2024-01-05T16:45:00Z',
	},
	{
		id: 'rpt_4',
		site: 'mybusiness.com',
		status: 'sent',
		createdAt: '2024-01-03T09:00:00Z',
	},
	{
		id: 'rpt_5',
		site: 'example.com',
		status: 'sent',
		createdAt: '2024-01-04T09:00:00Z',
	},
	{
		id: 'rpt_6',
		site: 'clientsite.org',
		status: 'sent',
		createdAt: '2024-01-06T09:00:00Z',
	},
	{
		id: 'rpt_7',
		site: 'mybusiness.com',
		status: 'error',
		createdAt: '2024-01-07T09:00:00Z',
	},
	{
		id: 'rpt_8',
		site: 'example.com',
		status: 'sent',
		createdAt: '2024-01-08T09:00:00Z',
	},
];

export default function useFetchReports() {
	const agencyId = useSelector( getActiveAgencyId );

	const isMock = true;

	return useQuery( {
		// TODO: Remove this once the API is ready
		// eslint-disable-next-line @tanstack/query/exhaustive-deps
		queryKey: [ 'a4a-reports', agencyId ],
		queryFn: () =>
			isMock
				? mockReportsData
				: wpcom.req.get( {
						apiNamespace: 'wpcom/v2',
						path: `/agency/${ agencyId }/reports`,
				  } ),
		enabled: !! agencyId,
		refetchOnWindowFocus: true,
		staleTime: 0,
	} );
}
