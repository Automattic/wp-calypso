import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteGoals( siteId: string | number | undefined ) {
	return useQuery(
		'site-goals-' + siteId,
		async () =>
			await wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/site-goals`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			refetchOnWindowFocus: false,
			enabled: !! siteId,
		}
	);
}
