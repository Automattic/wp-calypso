import { useTranslate } from 'i18n-calypso';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import FullListView from '../plugins-browser/full-list-view';
import usePlugins from '../use-plugins';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites } ) => {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
	} );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || category;
	const translate = useTranslate();

	let title = '';
	if ( categoryName && pagination ) {
		title = translate(
			'Found %(total)s plugin under "%(categoryName)s"',
			'Found %(total)s plugins under "%(categoryName)s"',
			{
				count: pagination.results,
				textOnly: true,
				args: {
					total: pagination.results,
					categoryName,
				},
			}
		);
	}

	return (
		<FullListView
			plugins={ plugins }
			listName={ category }
			title={ title }
			site={ siteSlug }
			showPlaceholders={ isFetching }
			currentSites={ sites }
			variant={ PluginsBrowserListVariant.InfiniteScroll }
			fetchNextPage={ fetchNextPage }
			extended
		/>
	);
};

export default PluginsCategoryResultsPage;
