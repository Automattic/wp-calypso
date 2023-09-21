import { UseQueryResult } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import MainComponent from 'calypso/components/main';
import { RelatedPlugin } from 'calypso/data/marketplace/types';
import { useGetRelatedPlugins } from 'calypso/data/marketplace/use-get-related-plugins';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import './style.scss';

export function RelatedPluginsPage( {
	pluginSlug,
	siteUrl,
}: {
	pluginSlug: string;
	siteUrl: string;
} ) {
	const translate = useTranslate();
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );

	const { data: relatedPlugins = [], isLoading } = useGetRelatedPlugins(
		pluginSlug,
		20
	) as UseQueryResult< RelatedPlugin[] >;

	return (
		<MainComponent wideLayout className="related-plugins-page">
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
