import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteIntent( siteId: string | number | undefined ) {
	return useQuery< {
		site_intent: '';
	} >(
		'site-intent-' + siteId,
		async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/site-intent`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			enabled: !! siteId,
		}
	);
}
