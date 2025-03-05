import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useFetchWooPaymentsData( autoRefresh: boolean ) {
	const agencyId = useSelector( getActiveAgencyId );

	return useQuery( {
		queryKey: [ 'a4a-site-woopayments-data', agencyId ],
		queryFn: () =>
			wpcom.req.get( {
				apiNamespace: 'wpcom/v2',
				path: `/agency/${ agencyId }/woocommerce/woopayments`,
			} ),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		staleTime: 0,
		refetchInterval: autoRefresh ? 1000 * 60 : undefined,
	} );
}
