import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import PluginDetailsBody from 'calypso/my-sites/plugins/plugin-details-body';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginAvailableOnSitesList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details/sites-with-installed-plugin-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import {
	getSiteObjectsWithPlugin,
	getSiteObjectsWithoutPlugin,
} from 'calypso/state/plugins/installed/selectors';
import { isFetching as isWporgPluginFetchingSelector } from 'calypso/state/plugins/wporg/selectors';
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
	sitesWithPlugins,
	showPlaceholder,
	isMarketplaceProduct,
	isWpcom,
}: Props ): ReactElement {
	const translate = useTranslate();

	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSiteObjectsWithoutPlugin( state, siteIds, pluginSlug )
	);

	const isLoading = useSelector( ( state ) => isWporgPluginFetchingSelector( state, pluginSlug ) );

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
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ sitesWithPlugins }
				plugins={ [ fullPlugin ] }
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
			<SitesWithInstalledPluginsList
				sites={ sitesWithPlugin }
				selectedSite={ selectedSite }
				isLoading={ isLoading }
				plugin={ fullPlugin }
			/>
			<PluginAvailableOnSitesList
				sites={ sitesWithoutPlugin }
				selectedSite={ selectedSite }
				isLoading={ isLoading }
				plugin={ fullPlugin }
			/>
			<PluginDetailsBody
				fullPlugin={ fullPlugin }
				isMarketplaceProduct={ isMarketplaceProduct }
				isWpcom={ isWpcom }
			/>
		</div>
	);
}
