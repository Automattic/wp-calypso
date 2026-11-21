import page from '@automattic/calypso-router';
import { Button, __experimentalHStack as HStack } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import FullWidthSection from 'calypso/components/full-width-section';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import BusinessPlanBanner from 'calypso/my-sites/plugins/plugins-banners/business-plan-banner';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import UpgradeNudge from 'calypso/my-sites/plugins/plugins-discovery-page/upgrade-nudge';
import { BASE_STALE_TIME } from 'calypso/state/constants';
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

const PluginsCategoryResultsPage = ( {
	category,
	siteSlug,
	sites,
	page: currentPage = 1,
	pathname,
	isPaginated = false,
} ) => {
	const { plugins, isFetching, fetchNextPage, hasNextPage, pagination } = usePlugins( {
		category,
		infinite: ! isPaginated,
		slugs: category === 'wpbeginner' ? WPBEGINNER_PLUGINS : undefined,
		page: currentPage,
		// Outlasts the server's 2h stale time, so hydrating a server-rendered page doesn't refetch it.
		staleTime: isPaginated ? 2 * BASE_STALE_TIME : undefined,
	} );

	const isPastLastPage = isPaginated && currentPage > 1 && ! isFetching && ! plugins.length;
	useEffect( () => {
		// The server already responded with a 404, so show the first page instead of placeholders.
		if ( isPastLastPage ) {
			page.replace( getCategoryPageUrl( pathname, 1 ) );
		}
	}, [ isPastLastPage, pathname ] );

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

	const pageUrls = isPaginated
		? getCategoryPaginationUrls( { pathname, page: currentPage, hasNextPage } )
		: {};
	const pageNumbers = isPaginated
		? getCategoryPageNumbers(
				currentPage,
				Math.max( getCategoryPageCount( pagination.results ), currentPage )
			)
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
										variant={ pageNumber === currentPage ? 'primary' : 'tertiary' }
										href={ getCategoryPageUrl( pathname, pageNumber ) }
										aria-current={ pageNumber === currentPage ? 'page' : undefined }
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
