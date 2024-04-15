import { createInterpolateElement } from '@wordpress/element';
import { useCorePluginsQuery, type CorePlugin } from 'calypso/data/plugins/use-core-plugins-query';
import type { SiteSlug } from 'calypso/types';

export function usePreparePluginsTooltipInfo( siteSlug: SiteSlug ) {
	const { data: plugins = [] } = useCorePluginsQuery( siteSlug, true, true );

	const preparePluginsTooltipInfo = ( pluginsArgs: string[] ) => {
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
	};

	return {
		preparePluginsTooltipInfo,
	};
}
