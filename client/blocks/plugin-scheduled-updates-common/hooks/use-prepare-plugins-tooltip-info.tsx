import { createInterpolateElement } from '@wordpress/element';
import {
	CorePluginsResponse,
	useCorePluginsQuery,
} from 'calypso/data/plugins/use-core-plugins-query';
import { useCoreSitesPluginsQuery } from 'calypso/data/plugins/use-core-sites-plugins-query';
import type { CorePlugin } from 'calypso/data/plugins/types';
import type { SiteId, SiteSlug } from 'calypso/types';

function getPluginName( plugins: CorePluginsResponse | CorePlugin[], plugin: string ) {
	return plugins.find( ( { plugin: _plugin }: CorePlugin ) => _plugin === plugin )?.name;
}

function getInstalledPlugins( plugins: CorePluginsResponse | CorePlugin[], pluginsArgs: string[] ) {
	return pluginsArgs
		.map( ( plugin: string ) => getPluginName( plugins, plugin ) )
		.filter( ( name ): name is string => !! name );
}

function prepareTooltip( plugins: CorePluginsResponse | CorePlugin[], pluginsArgs: string[] ) {
	const pluginsList = getInstalledPlugins( plugins, pluginsArgs ).join( '<br />' );

	return createInterpolateElement( `<div>${ pluginsList }</div>`, {
		div: <div className="tooltip--selected-plugins" />,
		br: <br />,
	} );
}

function countInstalledPlugins(
	plugins: CorePluginsResponse | CorePlugin[],
	pluginsArgs: string[]
) {
	return getInstalledPlugins( plugins, pluginsArgs ).length;
}

export function usePreparePluginsTooltipInfo( siteSlug: SiteSlug ) {
	const { data: plugins = [] } = useCorePluginsQuery( siteSlug, true, true );

	return {
		preparePluginsTooltipInfo: ( pluginsArgs: string[] ) => prepareTooltip( plugins, pluginsArgs ),
		countInstalledPlugins: ( pluginsArgs: string[] ) =>
			countInstalledPlugins( plugins, pluginsArgs ),
	};
}

export function usePrepareMultisitePluginsTooltipInfo( siteIds: SiteId[] ) {
	const { data: plugins = [] } = useCoreSitesPluginsQuery( siteIds, true, true );

	return {
		preparePluginsTooltipInfo: ( pluginsArgs: string[] ) => prepareTooltip( plugins, pluginsArgs ),
		countInstalledPlugins: ( pluginsArgs: string[] ) =>
			countInstalledPlugins( plugins, pluginsArgs ),
	};
}
