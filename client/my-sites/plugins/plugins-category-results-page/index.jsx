import { useTranslate } from 'i18n-calypso';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { WPBEGINNER_PLUGINS } from '../constants';
import usePlugins from '../use-plugins';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites } ) => {
	const { plugins, isFetching, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
		slugs: category === 'wpbeginner' ? WPBEGINNER_PLUGINS : undefined,
	} );

	const categories = useCategories();
	const categoryName = categories[ category ]?.title || category;
	const categoryDescription = categories[ category ]?.description;
	const translate = useTranslate();

	let resultCount = '';
	if ( categoryName && pagination ) {
		resultCount = translate( '%(total)s plugin', '%(total)s plugins', {
			count: pagination.results,
			textOnly: true,
			args: {
				total: pagination.results.toLocaleString(),
			},
		} );
	}

	return (
		<>
			<UpgradeNudge siteSlug={ siteSlug } paidPlugins />
			<PluginsBrowserList
				title={ categoryName }
				subtitle={ categoryDescription }
				resultCount={ resultCount }
				plugins={ plugins }
				listName={ category }
				listType="browse"
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

export default PluginsCategoryResultsPage;
