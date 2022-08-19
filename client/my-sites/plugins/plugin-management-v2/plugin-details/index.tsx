import { useTranslate } from 'i18n-calypso';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import PluginDetailsBody from 'calypso/my-sites/plugins/plugin-details-body';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import type { Plugin } from '../types';
import type { SiteData } from 'calypso/state/ui/selectors/site-data';
import type { ReactElement } from 'react';

import './style.scss';

interface Props {
	selectedSite: SiteData;
	pluginSlug: string;
	fullPlugin: Plugin;
	sitesWithPlugins: Array< SiteData >;
	showPlaceholder: boolean;
	isMarketplaceProduct: boolean;
	isWpcom: boolean;
}

export default function PluginDetailsV2( {
	selectedSite,
	pluginSlug,
	fullPlugin,
	showPlaceholder,
	isMarketplaceProduct,
	isWpcom,
}: Props ): ReactElement {
	const translate = useTranslate();

	const breadcrumbs = [
		{
			label: translate( 'Plugins' ),
			href: `/plugins/manage/${ selectedSite?.slug || '' }`,
			id: 'plugins',
		},
		{
			label: fullPlugin.name,
			href: `/plugins/${ pluginSlug }/${ selectedSite?.slug || '' }`,
			id: `plugin-${ pluginSlug }`,
		},
	];

	return (
		<div className="plugin-details">
			<FixedNavigationHeader
				className="plugin-details__header"
				compactBreadcrumb={ false }
				navigationItems={ breadcrumbs }
			/>
			<div className="plugin-details__page legacy">
				<div className="plugin-details__layout plugin-details__top-section">
					<div className="plugin-details__layout-col-left">
						<PluginDetailsHeader
							isJetpackCloud
							plugin={ fullPlugin }
							isPlaceholder={ showPlaceholder }
						/>
					</div>
				</div>
			</div>
			<PluginDetailsBody
				fullPlugin={ fullPlugin }
				isMarketplaceProduct={ isMarketplaceProduct }
				isWpcom={ isWpcom }
			/>
		</div>
	);
}
