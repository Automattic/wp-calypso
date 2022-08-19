import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import PluginDetailsBody from 'calypso/my-sites/plugins/plugin-details-body';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import SitesWithInstalledPluginsList from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details/sites-with-installed-plugin-list';
import PluginRowFormatter from 'calypso/my-sites/plugins/plugin-management-v2/plugin-row-formatter';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { getSiteObjectsWithPlugin } from 'calypso/state/plugins/installed/selectors';
import { isFetching as isWporgPluginFetchingSelector } from 'calypso/state/plugins/wporg/selectors';
import type { Plugin, PluginRowFormatterArgs } from '../types';
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

	const rowFormatter = ( { item, ...rest }: PluginRowFormatterArgs ) => {
		return <PluginRowFormatter { ...rest } item={ fullPlugin } selectedSite={ item } />;
	};

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
			<SitesWithInstalledPluginsList
				sites={ sitesWithPlugin }
				selectedSite={ selectedSite }
				isLoading={ isLoading }
				rowFormatter={ rowFormatter }
			/>
			<PluginDetailsBody
				fullPlugin={ fullPlugin }
				isMarketplaceProduct={ isMarketplaceProduct }
				isWpcom={ isWpcom }
			/>
		</div>
	);
}
