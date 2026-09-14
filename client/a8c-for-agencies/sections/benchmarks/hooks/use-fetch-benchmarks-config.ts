import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { BenchmarksConfig } from '../constants';

export const getFetchBenchmarksConfigQueryKey = ( agencyId: number | undefined ) => [
	'a4a-agency-benchmarks-config',
	agencyId,
];

export default function useFetchBenchmarksConfig() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< BenchmarksConfig >( {
		queryKey: getFetchBenchmarksConfigQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/benchmarks/config`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}
