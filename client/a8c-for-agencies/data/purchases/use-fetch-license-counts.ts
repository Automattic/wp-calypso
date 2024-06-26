import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export const getFetchLicenseCountsQueryKey = ( agencyId?: number ) => {
	return [ 'a4a-license-counts', agencyId ];
};

export default function useFetchLicenseCounts( staleTime = 0 ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getFetchLicenseCountsQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/licenses/counts',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
				}
			),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		staleTime,
	} );
}
