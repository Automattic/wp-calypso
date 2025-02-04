import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { decodeEntitiesFromPlugins } from './helpers';
import type { SitePlugin } from './types';
import type { SiteId, SiteSlug } from 'calypso/types';

export type SitePluginsResponse = {
	file_mod_capabilities: {
		modify_files: boolean;
		autoupdate_files: boolean;
	};
	plugins: SitePlugin[];
};

/**
 * Fetches the plugins for a given site
 * @param siteIdOrSlug The site ID or slug
 */
export const useSitePluginsQuery = (
	siteIdOrSlug: SiteId | SiteSlug | undefined
): UseQueryResult< SitePluginsResponse > => {
	return useQuery< SitePluginsResponse >( {
		queryKey: [ 'site-plugins', siteIdOrSlug ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/sites/${ siteIdOrSlug }/plugins`,
				apiVersion: '1.2',
			} );
		},
		enabled: !! siteIdOrSlug,
		retry: false,
		refetchOnWindowFocus: false,
		select: ( data ) => {
			return {
				...data,
				plugins: decodeEntitiesFromPlugins( data.plugins, [ 'display_name' ] ),
			};
		},
	} );
};
