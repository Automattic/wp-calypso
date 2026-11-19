import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import FullWidthSection from 'calypso/components/full-width-section';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import BusinessPlanBanner from 'calypso/my-sites/plugins/plugins-banners/business-plan-banner';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getCategoryPaginationUrls } from '../category-pagination';
import { WPBEGINNER_PLUGINS } from '../constants';
import { useIsMarketplaceRedesignEnabled } from '../hooks/use-is-marketplace-redesign-enabled';
import usePlugins from '../use-plugins';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites, page = 1, pathname } ) => {
	const { plugins, isFetching, fetchNextPage, hasNextPage, pagination } = usePlugins( {
		category,
		infinite: true,
		slugs: category === 'wpbeginner' ? WPBEGINNER_PLUGINS : undefined,
		page,
	} );
	const isLoggedIn = useSelector( isUserLoggedIn );

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

	const pageUrls =
		! isLoggedIn && pathname
			? getCategoryPaginationUrls( {
					pathname,
					page,
					loadedPages: pagination?.page,
					hasNextPage,
				} )
			: {};

	return (
		<FullWidthSection
			className="plugins-browser__category-results"
			enabled={ isMarketplaceRedesign }
		>
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
				injectAfterIndex={ isMarketplaceRedesign ? 12 : undefined }
				injectElement={ isMarketplaceRedesign ? <BusinessPlanBanner /> : undefined }
			/>
			<InfiniteScroll nextPageMethod={ fetchNextPage } />
			{ ( pageUrls.prev || pageUrls.next ) && (
				<nav
					className="plugins-category-results-page__pagination"
					aria-label={ translate( 'Plugins pagination' ) }
				>
					<HStack justify="space-between">
						{ pageUrls.prev ? (
							<Button __next40pxDefaultSize variant="secondary" href={ pageUrls.prev } rel="prev">
								{ translate( 'Previous page' ) }
							</Button>
						) : (
							<span />
						) }
						{ pageUrls.next && (
							<Button __next40pxDefaultSize variant="secondary" href={ pageUrls.next } rel="next">
								{ translate( 'Next page' ) }
							</Button>
						) }
					</HStack>
				</nav>
			) }
		</FullWidthSection>
	);
};

export default PluginsCategoryResultsPage;
