import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { BenchmarkAggregateRow } from '../constants';

export const getFetchBenchmarksAggregatesQueryKey = ( agencyId: number | undefined ) => [
	'a4a-agency-benchmarks-aggregates',
	agencyId,
];

export default function useFetchBenchmarksAggregates() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< BenchmarkAggregateRow[] >( {
		queryKey: getFetchBenchmarksAggregatesQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/benchmarks/aggregates`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
