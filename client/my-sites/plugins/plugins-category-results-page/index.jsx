import { useTranslate } from 'i18n-calypso';
import FullWidthSection from 'calypso/components/full-width-section';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import BusinessPlanBanner from 'calypso/my-sites/plugins/plugins-banners/business-plan-banner';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import PluginsPagination from 'calypso/my-sites/plugins/plugins-pagination';
import { WPBEGINNER_PLUGINS } from '../constants';
import { useIsMarketplaceRedesignEnabled } from '../hooks/use-is-marketplace-redesign-enabled';
import usePlugins from '../use-plugins';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites, isLoggedIn, path, page } ) => {
	const { plugins, isFetching, isError, retry, fetchNextPage, pagination } = usePlugins( {
		category,
		infinite: isLoggedIn,
		page: isLoggedIn ? undefined : page,
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

	const isMarketplaceRedesign = useIsMarketplaceRedesignEnabled();

	return (
		<FullWidthSection
			className="plugins-browser__category-results"
			enabled={ isMarketplaceRedesign }
		>
			<UpgradeNudge siteSlug={ siteSlug } paidPlugins />
			{ ( isLoggedIn || isFetching || ( ! isError && plugins.length > 0 ) ) && (
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
					variant={
						isLoggedIn
							? PluginsBrowserListVariant.InfiniteScroll
							: PluginsBrowserListVariant.Paginated
					}
					extended
					injectAfterIndex={ isMarketplaceRedesign ? 12 : undefined }
					injectElement={ isMarketplaceRedesign ? <BusinessPlanBanner /> : undefined }
				/>
			) }
			{ isLoggedIn ? (
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			) : (
				<PluginsPagination
					path={ path }
					page={ pagination.page }
					pages={ pagination.pages }
					isFetching={ isFetching }
					isError={ isError }
					retry={ retry }
					isEmpty={ plugins.length === 0 }
				/>
			) }
		</FullWidthSection>
	);
};

export default PluginsCategoryResultsPage;
