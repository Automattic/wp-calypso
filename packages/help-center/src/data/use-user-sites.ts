import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '@automattic/data-stores';

// Bump this version to invalidate the cache.
const VERSION = 2;

export function useUserSites( userId: number | string, enabled = true ) {
	return useQuery( {
		queryKey: [ 'user-sites', userId, VERSION ],
		queryFn: () =>
			wpcomRequest< { sites: SiteDetails[] } >( {
				path: '/me/sites/?include_domain_only=true',
				apiVersion: '1.2',
			} ),
		refetchOnWindowFocus: false,
		staleTime: 5 * 60 * 1000,
		enabled,
	} );
}
