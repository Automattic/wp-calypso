import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '../site';

export function useUserSites( userId: number | string, enabled = true ) {
	return useQuery(
		[ 'user-sites', userId ],
		() =>
			wpcomRequest< { sites: SiteDetails[] } >( {
				path: '/me/sites/',
				apiVersion: '1.1',
			} ),
		{
			refetchOnWindowFocus: false,
			staleTime: 5 * 60 * 1000,
			enabled,
		}
	);
}
