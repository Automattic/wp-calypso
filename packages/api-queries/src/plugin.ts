import {
	fetchWpOrgPlugin,
	fetchMarketplacePlugin,
	fetchMarketplacePlugins,
	installPlugin,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { invalidatePlugins, invalidateSitePlugins } from './site-plugins';

export const marketplacePluginQuery = ( slug: string ) =>
	queryOptions( {
		queryKey: [ 'marketplace-plugin', slug ],
		queryFn: () => fetchMarketplacePlugin( slug ),
	} );

export const marketplacePluginsQuery = () =>
	queryOptions( {
		queryKey: [ 'marketplace-plugins' ],
		queryFn: () => fetchMarketplacePlugins(),
	} );

export const wpOrgPluginQuery = ( slug: string, locale: string ) =>
	queryOptions( {
		queryKey: [ 'wp-org-plugin', slug, locale ],
		queryFn: () => fetchWpOrgPlugin( slug, locale ),
	} );

export const installPluginMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; slug: string } ) =>
			installPlugin( vars.siteId, vars.slug ),
		onSuccess: ( _data, vars ) => {
			// Refresh the plugin data so usePlugin sees the newly installed plugin.
			// We invalidate both the per-site plugins list and the aggregated plugins
			// query that `usePlugin` relies on to compute sitesWith/WithoutThisPlugin.
			invalidateSitePlugins( vars.siteId );
			invalidatePlugins();
		},
	} );
