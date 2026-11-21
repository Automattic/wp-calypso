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
import {
	getCategoryPageCount,
	getCategoryPageNumbers,
	getCategoryPageUrl,
	getCategoryPaginationUrls,
} from '../category-pagination';
import { WPBEGINNER_PLUGINS } from '../constants';
import { useIsMarketplaceRedesignEnabled } from '../hooks/use-is-marketplace-redesign-enabled';
import usePlugins from '../use-plugins';

import './style.scss';

const PluginsCategoryResultsPage = ( { category, siteSlug, sites, page = 1, pathname } ) => {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const isPaginated = ! isLoggedIn && !! pathname;
	const { plugins, isFetching, fetchNextPage, hasNextPage, pagination } = usePlugins( {
		category,
		infinite: ! isPaginated,
		slugs: category === 'wpbeginner' ? WPBEGINNER_PLUGINS : undefined,
		page,
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

	const pageUrls = isPaginated ? getCategoryPaginationUrls( { pathname, page, hasNextPage } ) : {};
	const pageNumbers = isPaginated
		? getCategoryPageNumbers( page, Math.max( getCategoryPageCount( pagination.results ), page ) )
		: [];

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
				variant={
					isPaginated
						? PluginsBrowserListVariant.Paginated
						: PluginsBrowserListVariant.InfiniteScroll
				}
				extended
				injectAfterIndex={ isMarketplaceRedesign ? 12 : undefined }
				injectElement={ isMarketplaceRedesign ? <BusinessPlanBanner /> : undefined }
			/>
			{ ! isPaginated && <InfiniteScroll nextPageMethod={ fetchNextPage } /> }
			{ ( pageUrls.prev || pageUrls.next || pageNumbers.length > 0 ) && (
				<nav
					className="plugins-category-results-page__pagination"
					aria-label={ translate( 'Plugins pagination' ) }
				>
					{ pageNumbers.length > 0 && (
						<HStack
							className="plugins-category-results-page__page-numbers"
							justify="center"
							spacing={ 1 }
							expanded={ false }
						>
							{ pageNumbers.map( ( pageNumber, index ) =>
								pageNumber === null ? (
									<span
										key={ `gap-${ index }` }
										className="plugins-category-results-page__page-gap"
										aria-hidden="true"
									>
										…
									</span>
								) : (
									<Button
										key={ pageNumber }
										__next40pxDefaultSize
										className="plugins-category-results-page__page-number"
										variant={ pageNumber === page ? 'primary' : 'tertiary' }
										href={ getCategoryPageUrl( pathname, pageNumber ) }
										aria-current={ pageNumber === page ? 'page' : undefined }
										aria-label={ translate( 'Page %(pageNumber)d', { args: { pageNumber } } ) }
									>
										{ pageNumber }
									</Button>
								)
							) }
						</HStack>
					) }
					{ pageUrls.prev && (
						<Button
							__next40pxDefaultSize
							className="plugins-category-results-page__prev"
							variant="secondary"
							href={ pageUrls.prev }
							rel="prev"
						>
							{ translate( 'Previous page' ) }
						</Button>
					) }
					{ pageUrls.next && (
						<Button
							__next40pxDefaultSize
							className="plugins-category-results-page__next"
							variant="secondary"
							href={ pageUrls.next }
							rel="next"
						>
							{ translate( 'Next page' ) }
						</Button>
					) }
				</nav>
			) }
		</FullWidthSection>
	);
};

export default PluginsCategoryResultsPage;
