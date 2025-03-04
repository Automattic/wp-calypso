import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { getActiveAgencyId } from 'calypso/state/a8c-for-agencies/agency/selectors';

export default function useFetchWooPaymentsData() {
	const agencyId = useSelector( getActiveAgencyId );

	const isApiEnabled = false;

	return useQuery( {
		queryKey: [ 'a4a-site-woopayments-data', agencyId, isApiEnabled ],
		queryFn: () =>
			isApiEnabled
				? wpcom.req.get( {
						apiNamespace: 'wpcom/v2',
						path: `/agency/${ agencyId }/woopayments`,
				  } )
				: Promise.resolve(),
		enabled: !! agencyId,
		refetchOnWindowFocus: false,
		staleTime: 0,
	} );
}
