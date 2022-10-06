import { useTranslate } from 'i18n-calypso';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import FullListView from '../plugins-browser/full-list-view';
import usePlugins from '../use-plugins';
import Header from './header';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites } ) => {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
	} );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || category;
	const categoryDescription = categories[ category ]?.categoryDescription;
	const translate = useTranslate();

	let title = '';
	if ( categoryName && pagination ) {
		title = translate( '%(total)s plugin', '%(total)s plugins', {
			count: pagination.results,
			textOnly: true,
			args: {
				total: pagination.results.toLocaleString(),
			},
		} );
	}

	return (
		<>
			<Header title={ categoryName } count={ title } subtitle={ categoryDescription } />

			<FullListView
				plugins={ plugins }
				listName={ category }
				site={ siteSlug }
				showPlaceholders={ isFetching }
				sites={ sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				fetchNextPage={ fetchNextPage }
				extended
			/>
		</>
	);
};

export default PluginsCategoryResultsPage;
