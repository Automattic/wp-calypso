import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import NoResults from 'calypso/my-sites/no-results';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import ClearSearchButton from '../clear-search-button';

/**
 * Module variables
 */
const PLUGIN_SLUGS_BLOCKLIST = [];

function isNotBlocked( plugin ) {
	return PLUGIN_SLUGS_BLOCKLIST.indexOf( plugin.slug ) === -1;
}

const SearchListView = ( {
	search: searchTerm,
	pluginsPagination,
	pluginsBySearchTerm,
	fetchNextPage,
	isFetchingPluginsBySearchTerm,
	siteSlug,
	siteId,
	sites,
	categoryName,
} ) => {
	const dispatch = useDispatch();

	const translate = useTranslate();

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

		if ( searchTerm && pluginsPagination ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_page', {
					search_term: searchTerm,
					page: pluginsPagination.page,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}
	}, [ searchTerm, pluginsPagination, dispatch, siteId ] );

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

			if ( categoryName ) {
				title = translate(
					'Found %(total)s plugin for "%(searchTerm)s" under "%(categoryName)s"',
					'Found %(total)s plugins for "%(searchTerm)s" under "%(categoryName)s"',
					{
						count: pluginsPagination.results,
						textOnly: true,
						args: {
							total: pluginsPagination.results,
							searchTerm,
							categoryName,
						},
					}
				);
			}
		}

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

export default SearchListView;
