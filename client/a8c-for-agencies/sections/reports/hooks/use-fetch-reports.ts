import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Report } from '../types';

// // Mock data for demonstration
const mockReportsData: Report[] = [];

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
