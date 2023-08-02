import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '@automattic/data-stores';

export function useWpcomSite( siteId: number | string | undefined, enabled = true ) {
	return useQuery( {
		queryKey: [ 'wpcom-site', siteId ],
		queryFn: () =>
			wpcomRequest< SiteDetails >( {
				path: '/sites/' + encodeURIComponent( siteId as string ),
				apiVersion: '1.1',
				query: 'force=wpcom',
			} ),
		refetchOnWindowFocus: false,
		staleTime: Infinity,
		enabled: !! siteId && enabled,
	} );
}
