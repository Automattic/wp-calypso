import { fetchWpOrgPlugin } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const wpOrgPluginQuery = ( slug: string, locale: string ) =>
	queryOptions( {
		queryKey: [ 'wp-org-plugin', slug, locale ],
		queryFn: () => fetchWpOrgPlugin( slug, locale ),
	} );
