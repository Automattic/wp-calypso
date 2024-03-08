import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import type { UrlData } from 'calypso/blocks/import/types';

export const useAnalyzeUrlQuery = ( domain: string, isValid?: boolean ) => {
	return useQuery( {
		queryKey: [ 'analyze-url-', domain ],
		queryFn: (): Promise< UrlData > =>
			wp.req.get( {
				path: '/imports/analyze-url?site_url=' + encodeURIComponent( domain ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		staleTime: 5000, // 5 seconds
		enabled: !! domain && isValid,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
