import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteIntent( siteId: string | number | undefined ) {
	return useQuery< {
		site_intent: '';
	} >( {
		queryKey: [ 'site-intent', siteId ],
		queryFn: async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/site-intent`,
				apiNamespace: 'wpcom/v2',
			} ),
		refetchOnWindowFocus: false,
		staleTime: Infinity,
		enabled: !! siteId,
	} );
}
