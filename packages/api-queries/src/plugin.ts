import { fetchWpOrgPlugin, fetchMarketplacePlugin } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const marketplacePluginQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'marketplace-plugin', slug ],
		queryFn: () => fetchMarketplacePlugin( slug ),
	} );

export const wpOrgPluginQuery = ( slug: string, locale: string ) =>
	queryOptions( {
		queryKey: [ 'wp-org-plugin', slug, locale ],
		queryFn: () => fetchWpOrgPlugin( slug, locale ),
	} );
