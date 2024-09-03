import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

const getFetchDevLicensesQueryKey = ( agencyId?: number ) => [ 'a4a-dev-licenses', agencyId ];

export default function useFetchDevLicenses() {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: getFetchDevLicensesQueryKey( agencyId ),
		queryFn: () =>
			wpcom.req.get(
				{
					apiNamespace: 'wpcom/v2',
					path: '/jetpack-licensing/dev-licenses',
				},
				{
					...( agencyId && { agency_id: agencyId } ),
				}
			),
		select: ( data ) => {
			return {
				licenses: data?.licenses,
				available: data?.available,
			};
		},
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
	} );
}

export { getFetchDevLicensesQueryKey };
