import { useTranslate } from 'i18n-calypso';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import ClearSearchButton from '../clear-search-button';
import usePlugins from '../use-plugins';

const FullListView = ( { category, siteSlug, sites } ) => {
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
		<>
			<PluginsBrowserList
				plugins={ plugins }
				listName={ category }
				subtitle={
					<>
						{ title }
						<ClearSearchButton />
					</>
				}
				site={ siteSlug }
				showPlaceholders={ isFetching }
				currentSites={ sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				extended
			/>

			<InfiniteScroll nextPageMethod={ fetchNextPage } />
		</>
	);
};

export default FullListView;
