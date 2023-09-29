import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { HostingProviderQueryResponse } from 'calypso/data/site-profiler/types';

export const useHostingProviderQuery = ( domain: string, isValid?: boolean ) => {
	return useQuery( {
		queryKey: [ 'hosting-provider-', domain ],
		queryFn: (): Promise< HostingProviderQueryResponse > =>
			wp.req.get( {
				path: '/site-profiler/hosting-provider/' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		enabled: !! domain && isValid,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
