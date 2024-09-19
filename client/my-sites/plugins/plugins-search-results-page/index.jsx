import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import NoResults from 'calypso/my-sites/no-results';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ClearSearchButton from '../plugins-browser/clear-search-button';
import { PaidPluginsSection } from '../plugins-discovery-page';
import usePlugins from '../use-plugins';

/**
 * Module variables
 */
const PLUGIN_SLUGS_BLOCKLIST = [];

function isNotBlocked( plugin ) {
	return PLUGIN_SLUGS_BLOCKLIST.indexOf( plugin.slug ) === -1;
}

const PluginsSearchResultPage = ( {
	search: searchTerm,
	siteSlug,
	siteId,
	sites,
	categoryName,
	setIsFetchingPluginsBySearchTerm,
} ) => {
	const {
		plugins: pluginsBySearchTerm = [],
		isFetching: isFetchingPluginsBySearchTerm,
		pagination: pluginsPagination,
		fetchNextPage,
	} = usePlugins( {
		infinite: true,
		search: searchTerm,
	} );

	const dispatch = useDispatch();

	const translate = useTranslate();

	/*
	 * Syncs the internal value of is fetching to share it with the search header
	 * This is a temporary solution until phase 4 of the refactor is implemented.
	 */
	useEffect( () => {
		setIsFetchingPluginsBySearchTerm( isFetchingPluginsBySearchTerm );
	}, [ setIsFetchingPluginsBySearchTerm, isFetchingPluginsBySearchTerm ] );

	useEffect( () => {
		if ( searchTerm && pluginsPagination?.page === 1 ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_show', {
					search_term: searchTerm,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}

		if ( searchTerm && pluginsPagination.page ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_page', {
					search_term: searchTerm,
					page: pluginsPagination.page,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}
	}, [ searchTerm, pluginsPagination.page, pluginsPagination.results, dispatch, siteId ] );

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
						total: pluginsPagination.results.toLocaleString(),
						searchTerm,
					},
				}
			);

			if ( categoryName ) {
				title = translate(
					'Found %(total)s plugin for "%(searchTerm)s" under "%(categoryName)s"',
					'Found %(total)s plugins for "%(searchTerm)s" under "%(categoryName)s"',
					{
						count: pluginsPagination.results,
						textOnly: true,
						args: {
							total: pluginsPagination.results.toLocaleString(),
							searchTerm,
							categoryName,
						},
					}
				);
			}
		}

		return (
			<>
				<UpgradeNudge siteSlug={ siteSlug } paidPlugins />
				<PluginsBrowserList
					plugins={ pluginsBySearchTerm.filter( isNotBlocked ) }
					listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
					listType="search"
					title={ translate( 'Search Results' ) }
					subtitle={
						<>
							{ title }
							<ClearSearchButton />
						</>
					}
					showReset
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

	return (
		// eslint-disable-next-line wpcalypso/jsx-classname-namespace
		<div className="plugins-browser__no-results">
			<NoResults
				text={ translate( 'No matches found' ) }
				subtitle={ translate(
					'Try using different keywords or check below our must-have premium plugins'
				) }
			/>
			<PaidPluginsSection noHeader />
		</div>
	);
};

export default PluginsSearchResultPage;
