import { createInterpolateElement } from '@wordpress/element';
import { SitePlugin, useSitePluginsQuery } from 'calypso/data/plugins/use-site-plugins-query';
import type { SiteSlug } from 'calypso/types';

export function usePreparePluginsTooltipInfo( siteSlug: SiteSlug ) {
	const { data: pluginsData } = useSitePluginsQuery( siteSlug );
	const plugins = pluginsData?.plugins ?? [];

	const preparePluginsTooltipInfo = ( pluginsArgs: string[] ) => {
		const pluginsList = pluginsArgs
			.map(
				( plugin: string ) =>
					plugins.find( ( { name }: SitePlugin ) => name === plugin )?.display_name
			)
			.join( '<br />' );

		return createInterpolateElement( `<div>${ pluginsList }</div>`, {
			div: <div className="tooltip--selected-plugins" />,
			br: <br />,
		} );
	};

	return {
		preparePluginsTooltipInfo,
	};
}
