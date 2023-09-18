import { useQuery } from '@tanstack/react-query';
import { HostingProviderQueryResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';

export const useHostingProviderQuery = ( domain: string ) => {
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
		enabled: !! domain,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
