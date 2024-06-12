import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

interface useStoreSandboxStatusQueryResponse {
	sandbox_status: boolean;
}

function mapResult( response: useStoreSandboxStatusQueryResponse ): boolean {
	return response.sandbox_status;
}

export default function useStoreSandboxStatusQuery() {
	return useQuery( {
		queryKey: [ 'store-sandbox' ],
		queryFn: () =>
			wp.req.get( {
				path: '/store-sandbox/status',
				apiNamespace: 'wpcom/v2',
			} ),
		select: mapResult,
		retry: false,
		refetchOnWindowFocus: true,
	} );
}
