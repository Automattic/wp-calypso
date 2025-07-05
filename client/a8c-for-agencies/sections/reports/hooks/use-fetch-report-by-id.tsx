import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { Report, ReportError } from '../types';

export default function useFetchReportById( reportId: number | null ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< Report, ReportError >( {
		queryKey: [ 'a4a-report', agencyId, reportId ],
		queryFn: async () => {
			return wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/reports/${ reportId }`,
			} );
		},
		enabled: !! agencyId && !! reportId,
		refetchOnWindowFocus: false,
		retry: ( failureCount, error ) => {
			if ( error.data.status === 404 ) {
				return false;
			}
			return failureCount < 3;
		},
	} );
}
