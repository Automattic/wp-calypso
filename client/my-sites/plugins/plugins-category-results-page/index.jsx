import { useTranslate } from 'i18n-calypso';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useESPlugin } from 'calypso/data/marketplace/use-es-query';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { WPBEGINNER_PLUGINS } from '../constants';
import usePlugins from '../use-plugins';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites } ) => {
	let plugins;
	let isFetching;
	const isWPBeginnerSpecial = category === 'wpbeginner';
	const { data: esPlugins = [], isFetching: esIsFetching } = useESPlugin( WPBEGINNER_PLUGINS, {
		enabled: isWPBeginnerSpecial,
	} );
	const {
		plugins: categoryPlugins,
		isFetching: categoryIsFetching,
		fetchNextPage,
		pagination,
	} = usePlugins( {
		category,
		infinite: true,
		enabled: ! isWPBeginnerSpecial,
	} );

	let results = pagination.results;
	const categories = useCategories();

	const categoryName = categories[ category ]?.title || category;
	const categoryDescription = categories[ category ]?.description;
	const translate = useTranslate();
	let size;

	if ( isWPBeginnerSpecial ) {
		plugins = esPlugins;
		isFetching = esIsFetching;
		results = esPlugins.length;
		size = results;
	} else {
		plugins = categoryPlugins;
		isFetching = categoryIsFetching;
	}

	let resultCount = '';
	if ( categoryName && pagination ) {
		resultCount = translate( '%(total)s plugin', '%(total)s plugins', {
			count: results,
			textOnly: true,
			args: {
				total: results.toLocaleString(),
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
				size={ size }
			/>
			<InfiniteScroll nextPageMethod={ fetchNextPage } />
		</>
	);
};

export default PluginsCategoryResultsPage;
