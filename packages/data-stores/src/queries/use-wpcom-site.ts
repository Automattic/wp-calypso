import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteDetails } from '../site';

export function useWpcomSite( siteId: number | string | undefined, enabled = true ) {
	return useQuery(
		[ 'wpcom-site', siteId ],
		() =>
			wpcomRequest< SiteDetails >( {
				path: '/sites/' + encodeURIComponent( siteId as string ),
				apiVersion: '1.1',
			} ),
		{
			refetchOnWindowFocus: false,
			staleTime: Infinity,
			enabled: !! siteId && enabled,
		}
	);
}
