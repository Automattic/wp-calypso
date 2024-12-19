import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import QueryAllJetpackSitesPlugins from 'calypso/components/data/query-all-jetpack-sites-plugins';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryJetpackSitesFeatures from 'calypso/components/data/query-jetpack-sites-features';
import QueryProductsList from 'calypso/components/data/query-products-list';
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
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import './style.scss';
import PluginAvailableOnSitesList from '../plugin-management-v2/plugin-details-v2/plugin-available-on-sites-list';
import SitesWithInstalledPluginsList from '../plugin-management-v2/plugin-details-v2/sites-with-installed-plugin-list';

interface Props {
	selectedSite: SiteDetails;
	pluginSlug: string;
	fullPlugin: object;
	sitesWithPlugins: Array< SiteDetails >;
	showPlaceholder: boolean;
	isMarketplaceProduct: boolean;
	isWpcom: boolean;
}

export default function PluginSitesPane( {
	pluginSlug,
	fullPlugin,
	showPlaceholder,
	isMarketplaceProduct,
	isWpcom,
}: Props ) {
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, plugin.slug )
	);

	const sites = useSelector( getSelectedOrAllSites );
	sites.sort( orderByAtomic );

	const sitesToShow = sites.filter( ( item ) => item && ! item?.options?.is_domain_only );
	const sitesWithoutPlugin = sitesToShow.filter(
		( site ) => ! sitesWithPlugin.find( ( siteWithPlugin ) => siteWithPlugin.ID === site.ID )
	);

	const isLoading = useSelector( ( state ) => isWporgPluginFetchingSelector( state, plugin.slug ) );

	const dispatch = useDispatch();

	useEffect( () => {
		return () => {
			dispatch( resetPluginStatuses() );
		};
	}, [ dispatch ] );

	const isLoading = useSelector( ( state ) => isWporgPluginFetchingSelector( state, pluginSlug ) );

	return (
		<div className="plugin-details-v2">
			{ siteIds.length === 1 ? (
				<QueryJetpackPlugins siteIds={ siteIds } />
			) : (
				<QueryAllJetpackSitesPlugins />
			) }
			<QueryJetpackSitesFeatures />
			<QueryProductsList persist />
			<div className="plugin-details-v2__top-container">
				<SitesWithInstalledPluginsList
					sites={ sitesWithPlugin }
					selectedSite={ null }
					isLoading={ isLoading }
					plugin={ fullPlugin }
				/>
				<PluginAvailableOnSitesList
					sites={ sitesWithoutPlugin }
					selectedSite={ null }
					isLoading={ isLoading }
					plugin={ fullPlugin }
				/>
			</div>
		</div>
	);
}
