import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

interface PaidSubscribersResponse {
	total: number;
	ownerships: unknown;
}

export default function useFetchPaidSubscribersCount( siteId?: number ) {
	return useQuery( {
		queryKey: [ 'paid-subscribers-count', siteId ],
		queryFn: () =>
			wpcomRequest< PaidSubscribersResponse >( {
				path: `/sites/${ siteId }/memberships/subscribers`,
				apiNamespace: 'wpcom/v2',
				method: 'GET',
			} ),
		select: ( data: PaidSubscribersResponse ) => {
			return data.total;
		},
		enabled: !! siteId,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
	} );
}
