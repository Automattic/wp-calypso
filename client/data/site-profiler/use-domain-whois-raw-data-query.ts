import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { DomainAnalyzerWhoisRawDataQueryResponse } from 'calypso/data/site-profiler/types';

export const useDomainAnalyzerWhoisRawDataQuery = ( domain: string, enableFetch: boolean ) => {
	return useQuery( {
		queryKey: [ 'whois-domain-', domain ],
		queryFn: (): Promise< DomainAnalyzerWhoisRawDataQueryResponse > =>
			wp.req.get( {
				path: '/site-profiler/whois/' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		enabled: enableFetch,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
