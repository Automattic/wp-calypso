import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
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
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
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

	const siteIds: any = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSiteObjectsWithoutPlugin( state, siteIds, pluginSlug )
	);
	const selectedOrAllSites = useSelector( getSelectedOrAllSites );

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
			<QueryJetpackPlugins siteIds={ siteIds } />
			<QueryEligibility siteId={ selectedSite?.ID } />
			<QuerySiteFeatures siteIds={ selectedOrAllSites.map( ( site ) => site?.ID ) } />
			<QueryProductsList persist />
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
			{ fullPlugin.fetched && (
				<PluginDetailsBody
					fullPlugin={ fullPlugin }
					isMarketplaceProduct={ isMarketplaceProduct }
					isWpcom={ isWpcom }
				/>
			) }
		</div>
	);
}
