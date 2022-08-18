import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import MainComponent from 'calypso/components/main';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import NoResults from 'calypso/my-sites/no-results';
import JetpackDisconnectedNotice from 'calypso/my-sites/plugins/jetpack-disconnected-notice';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import ClearSearchButton from 'calypso/my-sites/plugins/plugins-browser/clear-search-button';
import PluginsNavigationHeader from 'calypso/my-sites/plugins/plugins-navigation-header';
import PluginsPageViewTracker from 'calypso/my-sites/plugins/plugins-page-view-tracker';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import usePlugins from 'calypso/my-sites/plugins/use-plugins';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import { getSelectedSite } from 'calypso/state/ui/selectors';

// We should break this styles in a subsequent PR
import '../plugins-browser/style.scss';

/**
 * Module variables
 */
const PLUGIN_SLUGS_BLOCKLIST = [];

function isNotBlocked( plugin ) {
	return PLUGIN_SLUGS_BLOCKLIST.indexOf( plugin.slug ) === -1;
}

const PluginsSearchResultList = ( {
	pluginsBySearchTerm,
	isFetchingPluginsBySearchTerm,
	pluginsPagination,
	searchTerm,
	siteSlug,
	sites,
	fetchNextPage,
} ) => {
	const translate = useTranslate();

	if ( pluginsBySearchTerm.length > 0 || isFetchingPluginsBySearchTerm ) {
		let title = translate( 'Search results for "%(searchTerm)s"', {
			textOnly: true,
			args: { searchTerm },
		} );

		if ( pluginsPagination ) {
			title = translate(
				'Found %(total)s plugin for "%(searchTerm)s"',
				'Found %(total)s plugins for "%(searchTerm)s"',
				{
					count: pluginsPagination.results,
					textOnly: true,
					args: {
						total: pluginsPagination.results,
						searchTerm,
					},
				}
			);

			return (
				<>
					<PluginsBrowserList
						plugins={ pluginsBySearchTerm.filter( isNotBlocked ) }
						listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
						subtitle={
							<>
								{ title }
								<ClearSearchButton />
							</>
						}
						showReset={ true }
						site={ siteSlug }
						showPlaceholders={ isFetchingPluginsBySearchTerm }
						currentSites={ sites }
						variant={ PluginsBrowserListVariant.Paginated }
						extended
						search={ searchTerm }
					/>
					<InfiniteScroll nextPageMethod={ fetchNextPage } />
				</>
			);
		}
	}

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="plugins-browser__no-results">
			<NoResults
				text={ translate( 'No plugins match your search for {{searchTerm/}}.', {
					textOnly: true,
					components: { searchTerm: <em>{ searchTerm }</em> },
				} ) }
			/>
		</div>
	);
};

const PluginsSearchResultPage = ( { trackPageViews = true, category, search, hideHeader } ) => {
	const {
		plugins: pluginsBySearchTerm = [],
		isFetching: isFetchingPluginsBySearchTerm,
		pagination: pluginsPagination,
		fetchNextPage,
	} = usePlugins( {
		infinite: true,
		search,
		wpcomEnabled: !! search,
		wporgEnabled: !! search,
	} );

	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();
	const searchRef = useRef( null );

	const dispatch = useDispatch();

	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

	useEffect( () => {
		if ( search && pluginsPagination?.page === 1 ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_show', {
					search_term: search,
					results_count: pluginsPagination?.results,
					blog_id: selectedSite?.ID,
				} )
			);
		}

		if ( search && pluginsPagination ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_page', {
					search_term: search,
					page: pluginsPagination.page,
					results_count: pluginsPagination?.results,
					blog_id: selectedSite?.ID,
				} )
			);
		}
	}, [ search, pluginsPagination, dispatch, selectedSite ] );

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PluginsPageViewTracker
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />

			<PluginsAnnouncementModal />
			{ ! hideHeader && (
				<PluginsNavigationHeader
					navigationHeaderRef={ navigationHeaderRef }
					category={ category }
					search={ search }
				/>
			) }
			<JetpackDisconnectedNotice />
			<SearchBoxHeader
				searchRef={ searchRef }
				popularSearchesRef={ searchHeaderRef }
				isSticky={ isAboveElement }
				searchTerm={ search }
				isSearching={ isFetchingPluginsBySearchTerm }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>
			<div className="plugins-browser__main-container">
				<PluginsSearchResultList
					pluginsBySearchTerm={ pluginsBySearchTerm }
					isFetchingPluginsBySearchTerm={ isFetchingPluginsBySearchTerm }
					pluginsPagination={ pluginsPagination }
					searchTerm={ search }
					siteSlug={ selectedSite?.slug }
					sites={ sites }
					fetchNextPage={ fetchNextPage }
				/>
			</div>
		</MainComponent>
	);
};

export default PluginsSearchResultPage;
