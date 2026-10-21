import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AgencyBenchmark } from '../constants';

export const getFetchAgencyBenchmarksListQueryKey = ( agencyId: number | undefined ) => [
	'a4a-agency-benchmarks-list',
	agencyId,
];

export default function useFetchAgencyBenchmarksList() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AgencyBenchmark[] >( {
		queryKey: getFetchAgencyBenchmarksListQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/benchmarks`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
