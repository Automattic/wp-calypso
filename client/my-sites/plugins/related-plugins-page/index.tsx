import { useBreakpoint } from '@automattic/viewport-react';
import { UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryProductsList from 'calypso/components/data/query-products-list';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import { appendBreadcrumb } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';

import './style.scss';

export function RelatedPluginsPage( {
	pluginSlug,
	siteUrl,
}: {
	pluginSlug: string;
	siteUrl: string;
} ) {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const isWide = useBreakpoint( '>960px' );
	const breadcrumbs = useSelector( getBreadcrumbs );

	const { data: relatedPlugins = [], isLoading } = useGetRelatedPlugins(
		pluginSlug,
		20
	) as UseQueryResult< RelatedPlugin[] >;

	useEffect( () => {
		dispatch(
			appendBreadcrumb( {
				label: translate( 'Related' ),
				id: 'plugins-related',
			} )
		);
	}, [] );

	return (
		<MainComponent wideLayout className="related-plugins-page">
			<QueryProductsList />
			<NavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ breadcrumbs } />
			<PluginsBrowserList
				title={ translate( 'Related Plugins' ) }
				subtitle=""
				search=""
				size={ false }
				resultCount={ false }
				browseAllLink=""
				plugins={ relatedPlugins }
				listName="related-plugins"
				listType="browse"
				site={ siteUrl }
				showPlaceholders={ isLoading }
				currentSites={ sites }
				variant={ PluginsBrowserListVariant.Fixed }
				extended
			/>
		</MainComponent>
	);
}
