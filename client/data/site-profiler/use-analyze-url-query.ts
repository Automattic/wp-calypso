import { useQuery, type QueryClient } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { UrlData } from 'calypso/blocks/import/types';

const analyzeUrlQueryKey = ( domain: string ) => [ 'analyze-url-', domain ];

/**
 * Stores a result looked up elsewhere, kept out of browser storage like the fetched ones.
 */
export const seedAnalyzeUrlQuery = ( queryClient: QueryClient, data: UrlData ) => {
	const queryKey = analyzeUrlQueryKey( data.url );
	queryClient.setQueryDefaults( queryKey, { meta: { persist: false } } );
	queryClient.setQueryData( queryKey, data );
};

export const useAnalyzeUrlQuery = ( domain: string, isValid?: boolean, staleTime = 5000 ) => {
	return useQuery( {
		queryKey: analyzeUrlQueryKey( domain ),
		queryFn: (): Promise< UrlData > =>
			wp.req.get( {
				path: '/imports/analyze-url?site_url=' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		staleTime,
		enabled: !! domain && isValid,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
