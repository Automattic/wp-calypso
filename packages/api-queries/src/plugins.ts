import {
	fetchUserSitesPlugins,
	fetchSitePlugins,
	activateSitePlugin,
	deactivateSitePlugin,
	updateSitePlugin,
	enableSitePluginAutoupdate,
	disableSitePluginAutoupdate,
	installSitePlugin,
	removeSitePlugin,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const pluginsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'sites-plugins' ],
		queryFn: () => fetchUserSitesPlugins(),
	} );

export const sitePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'plugins' ],
		queryFn: () => fetchSitePlugins( siteId ),
	} );

// Mutations for site-level plugin operations

const invalidateSitePlugins = ( siteId: number ) => {
	queryClient.invalidateQueries( sitePluginsQuery( siteId ) );
};

export const sitePluginActivateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => activateSitePlugin( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginDeactivateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => deactivateSitePlugin( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginUpdateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => updateSitePlugin( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginAutoupdateEnableMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => enableSitePluginAutoupdate( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginAutoupdateDisableMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => disableSitePluginAutoupdate( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginInstallMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( slug: string ) => installSitePlugin( siteId, slug ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );

export const sitePluginRemoveMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( pluginId: string ) => removeSitePlugin( siteId, pluginId ),
		onSuccess: () => invalidateSitePlugins( siteId ),
	} );
