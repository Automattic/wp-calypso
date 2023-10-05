import { useQuery } from '@tanstack/react-query';
import { DomainAnalyzerQueryResponse } from 'calypso/data/site-profiler/types';
import wp from 'calypso/lib/wp';

export const useDomainAnalyzerQuery = ( domain: string, isValid?: boolean ) => {
	return useQuery( {
		queryKey: [ 'domain-', domain ],
		queryFn: (): Promise< DomainAnalyzerQueryResponse > =>
			wp.req.get( {
				path: '/site-profiler/' + encodeURIComponent( domain ),
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
