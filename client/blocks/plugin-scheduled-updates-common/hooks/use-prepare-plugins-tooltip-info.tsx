import { createInterpolateElement } from '@wordpress/element';
import {
	CorePluginsResponse,
	useCorePluginsQuery,
} from 'calypso/data/plugins/use-core-plugins-query';
import { useCoreSitesPluginsQuery } from 'calypso/data/plugins/use-core-sites-plugins-query';
import type { CorePlugin } from 'calypso/data/plugins/types';
import type { SiteId, SiteSlug } from 'calypso/types';

function prepareTooltip( plugins: CorePluginsResponse | CorePlugin[], pluginsArgs: string[] ) {
	const pluginsList = pluginsArgs
		.map(
			( plugin: string ) =>
				plugins.find( ( { plugin: _plugin }: CorePlugin ) => _plugin === plugin )?.name
		)
		.join( '<br />' );

	return createInterpolateElement( `<div>${ pluginsList }</div>`, {
		div: <div className="tooltip--selected-plugins" />,
		br: <br />,
	} );
}

export function usePreparePluginsTooltipInfo( siteSlug: SiteSlug ) {
	const { data: plugins = [] } = useCorePluginsQuery( siteSlug, true, true );

	return {
		preparePluginsTooltipInfo: ( pluginsArgs: string[] ) => prepareTooltip( plugins, pluginsArgs ),
	};
}

export function usePrepareMultisitePluginsTooltipInfo( siteIds: SiteId[] ) {
	const { data: plugins = [] } = useCoreSitesPluginsQuery( siteIds, true, true );

	return {
		prepareMultiSitePluginsTooltipInfo: ( pluginsArgs: string[] ) =>
			prepareTooltip( plugins, pluginsArgs ),
	};
}
