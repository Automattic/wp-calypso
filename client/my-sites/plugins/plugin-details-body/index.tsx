import PluginDetailsSidebar from 'calypso/my-sites/plugins/plugin-details-sidebar';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';

interface Props {
	fullPlugin: any;
	isWpcom: boolean;
}

export default function PluginDetailsBody( { fullPlugin, isWpcom }: Props ) {
	return (
		<div className="plugin-details__layout plugin-details__body">
			<div className="plugin-details__layout-col-left">
				{ fullPlugin.wporg || fullPlugin.isMarketplaceProduct ? (
					<PluginSections plugin={ fullPlugin } isWpcom={ isWpcom } addBanner />
				) : (
					<PluginSectionsCustom plugin={ fullPlugin } />
				) }
			</div>
			<div className="plugin-details__layout-col-right">
				<PluginDetailsSidebar plugin={ fullPlugin } />
			</div>
		</div>
	);
}
