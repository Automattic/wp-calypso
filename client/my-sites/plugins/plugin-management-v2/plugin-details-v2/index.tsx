import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryJetpackSitesFeatures from 'calypso/components/data/query-jetpack-sites-features';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import PluginDetailsBody from 'calypso/my-sites/plugins/plugin-details-body';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginAvailableOnSitesList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import {
	getSiteObjectsWithPlugin,
	getSiteObjectsWithoutPlugin,
} from 'calypso/state/plugins/installed/selectors';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { isFetching as isWporgPluginFetchingSelector } from 'calypso/state/plugins/wporg/selectors';
import type { Plugin } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	selectedSite: SiteDetails;
	pluginSlug: string;
	fullPlugin: Plugin;
	sitesWithPlugins: Array< SiteDetails >;
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
}: Props ) {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const siteIds: any = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, pluginSlug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSiteObjectsWithoutPlugin( state, siteIds, pluginSlug )
	);

	useEffect( () => {
		return () => {
			dispatch( resetPluginStatuses() );
		};
	}, [ dispatch ] );

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
		<div className="plugin-details-v2">
			<QueryJetpackPlugins siteIds={ siteIds } />
			<QueryEligibility siteId={ selectedSite?.ID } />
			<QueryJetpackSitesFeatures />
			<QueryProductsList persist />
			<FixedNavigationHeader
				className="plugin-details-v2__header"
				compactBreadcrumb={ false }
				navigationItems={ breadcrumbs }
			/>
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ sitesWithPlugins }
				plugins={ [ fullPlugin ] }
			/>
			<div className="plugin-details-v2__top-container">
				<div className="plugin-details__page legacy">
					<div>
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
			</div>
			{ fullPlugin.fetched && (
				<div className="plugin-details-v2__body-container">
					<PluginDetailsBody
						fullPlugin={ fullPlugin }
						isMarketplaceProduct={ isMarketplaceProduct }
						isWpcom={ isWpcom }
					/>
				</div>
			) }
		</div>
	);
}
