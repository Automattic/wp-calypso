import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';
import type { AgencyBenchmark, Quarter } from '../constants';

type WpRestError = { data?: { status?: number } };

export const getFetchAgencyBenchmarkQueryKey = (
	agencyId: number | undefined,
	quarter: Quarter[ 'quarter' ],
	year: Quarter[ 'year' ]
) => [ 'a4a-agency-benchmark', agencyId, quarter, year ];

export default function useFetchAgencyBenchmark(
	quarter: Quarter[ 'quarter' ],
	year: Quarter[ 'year' ]
) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery< AgencyBenchmark | null >( {
		queryKey: getFetchAgencyBenchmarkQueryKey( agencyId, quarter, year ),
		queryFn: async () => {
			try {
				return await wpcom.req.get( {
					apiNamespace: 'wpcom/v2',
					path: `/agency/${ agencyId }/benchmarks/${ quarter }/${ year }`,
				} );
			} catch ( err ) {
				if ( ( err as WpRestError )?.data?.status === 404 ) {
					return null;
				}
				throw err;
			}
		},
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		retry: ( failureCount, error ) => {
			if ( ( error as WpRestError )?.data?.status === 404 ) {
				return false;
			}
			return failureCount < 3;
		},
	} );
}
