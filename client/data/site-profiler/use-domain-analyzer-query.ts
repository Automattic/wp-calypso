import { SourceSiteMigrationDetails } from '@automattic/data-stores/src/site';
import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export interface MigrationStatusError {
	status: number;
	message: string;
}

export const useDomainAnalyzerQuery = ( domain: string ) => {
	return useQuery( {
		queryKey: [ 'domain-', domain ],
		queryFn: (): Promise< SourceSiteMigrationDetails > =>
			wp.req.get( {
				path: '/site-profiler/' + encodeURIComponent( domain ),
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
