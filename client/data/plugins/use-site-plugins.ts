import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { SiteId, SiteSlug } from 'calypso/types';

/**
 * Fetches the plugins for a given site
 * @param siteIdOrSlug The site ID or slug
 */
export const useSitePlugins = ( siteIdOrSlug: SiteId | SiteSlug | undefined ) => {
	return useQuery( {
		queryKey: [ 'site-plugins', siteIdOrSlug ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteIdOrSlug }/plugins`,
				apiVersion: '1.2',
			} );
		},
		meta: {
			persist: false,
		},
		enabled: !! siteIdOrSlug,
		retry: false,
		refetchOnWindowFocus: false,
	} );
};
