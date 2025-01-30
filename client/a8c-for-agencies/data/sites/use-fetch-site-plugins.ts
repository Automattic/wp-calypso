import { useQuery, UseQueryResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type Response = { data: Plugin[] };

type Plugin = {
	plugin: string;
	status: string;
	name: string;
	plugin_uri?: string;
	author?: string;
	author_uri?: string;
	description?: {
		raw: string;
		rendered: string;
	};
	version: string;
	network_only?: boolean;
	requires_wp?: string;
	requires_php?: string;
	textdomain?: string;
};

interface FetchSitePluginsParams {
	siteId?: number;
}

/**
 * Hook to fetch plugins for a specific site
 * @param params Object containing siteId and optional status and slug filters
 * @returns UseQueryResult with plugins data
 */
export default function useFetchSitePlugins(
	params: FetchSitePluginsParams
): UseQueryResult< Response, Error > {
	const { siteId } = params;

	return useQuery( {
		queryKey: [ 'a4a-site-plugins', siteId ],
		queryFn: async () => {
			return wpcom.req.get(
				{
					path: `/jetpack-blogs/${ siteId }/rest-api/`,
					apiNamespace: 'rest/v1.1',
				},
				{
					path: '/wp/v2/plugins/',
					json: true,
				}
			);
		},
		enabled: !! siteId,
		refetchOnWindowFocus: false,
	} );
}
