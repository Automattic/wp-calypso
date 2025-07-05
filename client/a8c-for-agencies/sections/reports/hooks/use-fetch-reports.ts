import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import { getReportsQueryKey } from '../lib/get-reports-query-key';

export default function useFetchReports() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getReportsQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/reports`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
