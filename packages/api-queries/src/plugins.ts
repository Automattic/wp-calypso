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
	fetchSiteCorePlugins,
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

export const siteCorePluginsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'core-plugins' ],
		queryFn: () => fetchSiteCorePlugins( siteId ),
	} );

// Mutations for site-level plugin operations

export const invalidatePlugins = () => {
	queryClient.invalidateQueries( pluginsQuery() );
};

const invalidateSitePlugins = ( siteId: number ) => {
	queryClient.invalidateQueries( sitePluginsQuery( siteId ) );
};

export const sitePluginActivateMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			activateSitePlugin( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginDeactivateMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			deactivateSitePlugin( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginUpdateMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			updateSitePlugin( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginAutoupdateEnableMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			enableSitePluginAutoupdate( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginAutoupdateDisableMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			disableSitePluginAutoupdate( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginInstallMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			installSitePlugin( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );

export const sitePluginRemoveMutation = () =>
	mutationOptions( {
		mutationFn: ( vars: { siteId: number; pluginId: string } ) =>
			removeSitePlugin( vars.siteId, vars.pluginId ),
		onSuccess: ( _data, vars: { siteId: number } ) => invalidateSitePlugins( vars.siteId ),
	} );
