import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '../site';

export function useUserSites( enabled = true ) {
	return useQuery(
		'user-sites',
		() =>
			wpcomRequest< { sites: SiteDetails[] } >( {
				path: '/me/sites/',
				apiVersion: '1.1',
			} ),
		{
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			enabled,
		}
	);
}
