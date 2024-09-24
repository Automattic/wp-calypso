import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import QueryAllJetpackSitesPlugins from 'calypso/components/data/query-all-jetpack-sites-plugins';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import NavigationHeader from 'calypso/components/navigation-header';
import PluginDetailsBody from 'calypso/my-sites/plugins/plugin-details-body';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginAvailableOnSitesList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { useSelector, useDispatch } from 'calypso/state';
import {
	getSiteObjectsWithPlugin,
	getSiteObjectsWithoutPlugin,
} from 'calypso/state/plugins/installed/selectors';
import { resetPluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { isFetching as isWporgPluginFetchingSelector } from 'calypso/state/plugins/wporg/selectors';
import type { PluginComponentProps } from '../types';
import type { SiteDetails } from '@automattic/data-stores';

import './style.scss';

interface Props {
	selectedSite: SiteDetails;
	pluginSlug: string;
	fullPlugin: PluginComponentProps;
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
			{ siteIds.length === 1 ? (
				<QueryJetpackPlugins siteIds={ siteIds } />
			) : (
				<QueryAllJetpackSitesPlugins />
			) }
			<QueryEligibility siteId={ selectedSite?.ID } />
			<QueryProductsList persist />
			<NavigationHeader className="plugin-details-v2__header" navigationItems={ breadcrumbs } />
			<div className="plugin-details-v2__top-container">
				<div className="plugin-details__page legacy">
					<div>
						<div className="plugin-details__layout-col-left">
							<PluginDetailsHeader
								isJetpackCloud
								plugin={ fullPlugin }
								isPlaceholder={ showPlaceholder }
								isMarketplaceProduct={ isMarketplaceProduct }
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
