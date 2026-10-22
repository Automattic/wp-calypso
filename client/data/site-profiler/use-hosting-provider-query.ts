import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { HostingProviderQueryResponse } from 'calypso/data/site-profiler/types';

export const useHostingProviderQuery = ( domain: string, isValid?: boolean, timeout?: number ) => {
	return useQuery( {
		queryKey: [ 'hosting-provider-', domain, timeout ],
		queryFn: (): Promise< HostingProviderQueryResponse > => {
			const request = wp.req.get( {
				path: '/site-profiler/hosting-provider/' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} );
			if ( ! timeout ) {
				return request;
			}
			let timer: ReturnType< typeof setTimeout > | undefined;
			return Promise.race( [
				request,
				new Promise< never >( ( _resolve, reject ) => {
					timer = setTimeout(
						() => reject( new Error( 'The hosting provider lookup timed out.' ) ),
						timeout
					);
				} ),
			] ).finally( () => clearTimeout( timer ) );
		},
		meta: {
			persist: false,
		},
		enabled: !! domain && isValid,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
