import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '@automattic/data-stores';

export function useUserSites( userId: number | string, enabled = true ) {
	return useQuery( {
		queryKey: [ 'user-sites', userId ],
		queryFn: () =>
			wpcomRequest< { sites: SiteDetails[] } >( {
				path: '/me/sites/',
				apiVersion: '1.1',
			} ),
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
		enabled,
	} );
}
