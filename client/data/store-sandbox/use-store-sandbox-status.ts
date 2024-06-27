import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface useStoreSandboxStatusQueryResponse {
	sandbox_status: boolean;
	is_editable: boolean;
	reason_not_editable: string;
}

export default function useStoreSandboxStatusQuery(): UseQueryResult< useStoreSandboxStatusQueryResponse > {
	return useQuery( {
		queryKey: [ 'store-sandbox' ],
		queryFn: () =>
			wp.req.get( {
				path: '/store-sandbox/status',
				apiNamespace: 'wpcom/v2',
			} ),
		retry: false,
		refetchOnWindowFocus: true,
	} );
}
