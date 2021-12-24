import { isEnabled } from '@automattic/calypso-config';
import {
	isBusiness,
	isEcommerce,
	isEnterprise,
	findFirstSimilarPlanKey,
	FEATURE_UPLOAD_PLUGINS,
	TYPE_BUSINESS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import Search from '@automattic/search';
import { subscribeIsWithinBreakpoint, isWithinBreakpoint } from '@automattic/viewport';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/plugins-revamp.png';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryWporgPlugins from 'calypso/components/data/query-wporg-plugins';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import MainComponent from 'calypso/components/main';
import Pagination from 'calypso/components/pagination';
import { PaginationVariant } from 'calypso/components/pagination/constants';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import UrlSearch from 'calypso/lib/url-search';
import BillingIntervalSwitcher from 'calypso/my-sites/marketplace/components/billing-interval-switcher';
import { IntervalLength } from 'calypso/my-sites/marketplace/components/billing-interval-switcher/constants';
import NoResults from 'calypso/my-sites/no-results';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordTracksEvent, recordGoogleEvent } from 'calypso/state/analytics/actions';
import {
	fetchPluginsCategoryNextPage,
	fetchPluginsList,
} from 'calypso/state/plugins/wporg/actions';
import {
	getPluginsListByCategory,
	getPluginsListBySearchTerm,
	isFetchingPluginsList,
	getPluginsListPagination,
} from 'calypso/state/plugins/wporg/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import {
	getSitePlan,
	isJetpackSite,
	isRequestingSites,
	getSiteAdminUrl,
} from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;
const SEARCH_RESULTS_LIST_LENGTH = 12;

const PluginsBrowser = ( {
	trackPageViews = true,
	category,
	search,
	searchTitle,
	hideHeader,
	doSearch,
} ) => {
	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	// Billing period switcher.
	const isWide = useBreakpoint( '>1280px' );
	const [ billingPeriod, setBillingPeriod ] = useState( IntervalLength.MONTHLY );

	const hasBusinessPlan =
		sitePlan && ( isBusiness( sitePlan ) || isEnterprise( sitePlan ) || isEcommerce( sitePlan ) );

	const { data: paidPluginsRawList = [], isFetchingPaidPlugins } = useWPCOMPlugins( 'featured' );
	const paidPlugins = useMemo( () => paidPluginsRawList.map( updateWpComRating ), [
		paidPluginsRawList,
	] );
	const popularPlugins = useSelector( ( state ) => getPluginsListByCategory( state, 'popular' ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);
	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );
	const hasJetpack = useSelector( hasJetpackSites );
	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const pluginsByCategory = useSelector( ( state ) => getPluginsListByCategory( state, category ) );
	const pluginsByCategoryNew = useSelector( ( state ) => getPluginsListByCategory( state, 'new' ) );
	const pluginsByCategoryFeatured = useSelector( ( state ) =>
		getPluginsListByCategory( state, 'featured' )
	);
	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		pluginsByCategoryFeatured,
		jetpackNonAtomic
	);
	const isFetchingPluginsByCategory = useSelector( ( state ) =>
		isFetchingPluginsList( state, category )
	);
	const isFetchingPluginsByCategoryNew = useSelector( ( state ) =>
		isFetchingPluginsList( state, 'new' )
	);
	const isFetchingPluginsByCategoryPopular = useSelector( ( state ) =>
		isFetchingPluginsList( state, 'popular' )
	);
	const isFetchingPluginsByCategoryFeatured = useSelector( ( state ) =>
		isFetchingPluginsList( state, 'featured' )
	);
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite?.ID ) );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ isMobile, setIsMobile ] = useState();

	const shouldShowManageButton = useMemo( () => {
		if ( isJetpack ) {
			return true;
		}
		return ! selectedSite?.ID && hasJetpack;
	}, [ isJetpack, selectedSite, hasJetpack ] );

	const navigationItems = useMemo( () => {
		const items = [ { label: translate( 'Plugins' ), href: `/plugins/${ siteSlug || '' }` } ];
		if ( search ) {
			items.push( {
				label: translate( 'Search Results' ),
				href: `/plugins/${ siteSlug || '' }?s=${ search }`,
			} );
		}

		return items;
	}, [ search, siteSlug ] );

	const annoncementPages = [
		{
			headline: translate( 'ITS NEW!' ),
			heading: translate( 'All the plugins and more' ),
			content: translate(
				'This page may look different as we’ve made some changes to improve the experience for you. Stay tuned for even more exciting updates to come!'
			),
			featureImage: announcementImage,
		},
	];

	useEffect( () => {
		if ( search && searchTitle ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_noresults_recommendations_show', {
					search_query: search,
				} )
			);
		}
	}, [] );

	useEffect( () => {
		if ( isWithinBreakpoint( '<960px' ) ) {
			setIsMobile( true );
		}
		const unsubscribe = subscribeIsWithinBreakpoint( '<960px', ( isMobileLayout ) =>
			setIsMobile( isMobileLayout )
		);

		return () => {
			if ( typeof unsubscribe === 'function' ) {
				unsubscribe();
			}
		};
	}, [] );

	const fetchNextPagePlugins = useCallback( () => {
		if ( ! category ) {
			return;
		}

		// If a request for this category is in progress, don't issue a new one
		if ( isFetchingPluginsByCategory ) {
			return;
		}

		dispatch( fetchPluginsCategoryNextPage( category ) );
	}, [ category, isFetchingPluginsByCategory ] );

	if ( ! isRequestingSitesData && noPermissionsError ) {
		return <NoPermissionsError title={ translate( 'Plugins', { textOnly: true } ) } />;
	}

	return (
		<MainComponent wideLayout>
			{ category && <QueryWporgPlugins category={ category } /> }
			{ search && <QueryWporgPlugins searchTerm={ search } /> }
			{ ! category && ! search && (
				<>
					<QueryWporgPlugins category="new" />
					<QueryWporgPlugins category="popular" />
					<QueryWporgPlugins category="featured" />
				</>
			) }
			{ isEnabled( 'marketplace-v1' ) && ! jetpackNonAtomic && <QueryProductsList /> }
			<PageViewTrackerWrapper
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />
			<SidebarNavigation />

			<AnnouncementModal
				announcementId="plugins-page-revamp"
				pages={ annoncementPages }
				finishButtonText={ translate( "Let's explore!" ) }
			/>
			{ ! hideHeader && (
				<FixedNavigationHeader
					className="plugins-browser__header"
					navigationItems={ navigationItems }
				>
					{ isEnabled( 'marketplace-v1' ) && ! jetpackNonAtomic && (
						<div className="plugins-browser__billling-interval-switcher">
							<BillingIntervalSwitcher
								billingPeriod={ billingPeriod }
								onChange={ setBillingPeriod }
								compact={ ! isWide }
							/>
						</div>
					) }
					<div className="plugins-browser__main-buttons">
						<ManageButton
							shouldShowManageButton={ shouldShowManageButton }
							siteAdminUrl={ siteAdminUrl }
							siteSlug={ siteSlug }
							jetpackNonAtomic={ jetpackNonAtomic }
						/>

						<UploadPluginButton isMobile={ isMobile } siteSlug={ siteSlug } />
					</div>

					<div className="plugins-browser__searchbox">
						{ <SearchBox isMobile={ isMobile } doSearch={ doSearch } search={ search } /> }
					</div>
				</FixedNavigationHeader>
			) }

			<UpgradeNudge
				selectedSite={ selectedSite }
				sitePlan={ sitePlan }
				isVip={ isVip }
				jetpackNonAtomic={ jetpackNonAtomic }
				hasBusinessPlan={ hasBusinessPlan }
				siteSlug={ siteSlug }
			/>

			<PluginBrowserContent
				pluginsByCategoryNew={ pluginsByCategoryNew }
				isFetchingPluginsByCategoryNew={ isFetchingPluginsByCategoryNew }
				pluginsByCategoryPopular={ pluginsByCategoryPopular }
				isFetchingPluginsByCategoryPopular={ isFetchingPluginsByCategoryPopular }
				pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
				isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
				search={ search }
				category={ category }
				isFetchingPluginsByCategory={ isFetchingPluginsByCategory }
				pluginsByCategory={ pluginsByCategory }
				paidPlugins={ paidPlugins }
				isFetchingPaidPlugins={ isFetchingPaidPlugins }
				sites={ sites }
				searchTitle={ searchTitle }
				siteSlug={ siteSlug }
				jetpackNonAtomic={ jetpackNonAtomic }
				billingPeriod={ billingPeriod }
			/>
			<InfiniteScroll nextPageMethod={ fetchNextPagePlugins } />
		</MainComponent>
	);
};

const WrappedSearch = ( props ) => <Search { ...props } />;

const SearchListView = ( {
	search: searchTerm,
	searchTitle: searchTitleTerm,
	siteSlug,
	sites,
	billingPeriod,
} ) => {
	const pluginsBySearchTerm = useSelector( ( state ) =>
		getPluginsListBySearchTerm( state, searchTerm )
	);
	const isFetchingPluginsBySearchTerm = useSelector( ( state ) =>
		isFetchingPluginsList( state, null, searchTerm )
	);
	const pluginsPagination = useSelector( ( state ) =>
		getPluginsListPagination( state, searchTerm )
	);
	const {
		data: paidPluginsBySearchTermRaw = [],
		isFetchingPaidPluginsBySearchTerm,
	} = useWPCOMPlugins( 'all', searchTerm, {
		enabled: !! searchTerm,
	} );
	const paidPluginsBySearchTerm = useMemo(
		() => paidPluginsBySearchTermRaw.map( updateWpComRating ),
		[ paidPluginsBySearchTermRaw ]
	);
	const translate = useTranslate();
	const dispatch = useDispatch();

	if (
		pluginsBySearchTerm.length > 0 ||
		isFetchingPluginsBySearchTerm ||
		isFetchingPaidPluginsBySearchTerm
	) {
		const searchTitle =
			searchTitleTerm ||
			translate( 'Search results for {{b}}%(searchTerm)s{{/b}}', {
				textOnly: true,
				args: {
					searchTerm,
				},
				components: {
					b: <b />,
				},
			} );

		const subtitle =
			pluginsPagination &&
			translate( '%(total)s plugin', '%(total)s plugins', {
				count: pluginsPagination.results,
				textOnly: true,
				args: {
					total: pluginsPagination.results,
				},
			} );

		return (
			<>
				<PluginsBrowserList
					plugins={ [ ...paidPluginsBySearchTerm, ...pluginsBySearchTerm ] }
					listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
					title={ searchTitle }
					subtitle={ subtitle }
					site={ siteSlug }
					showPlaceholders={ isFetchingPluginsBySearchTerm || isFetchingPaidPluginsBySearchTerm }
					size={ SEARCH_RESULTS_LIST_LENGTH }
					currentSites={ sites }
					variant={ PluginsBrowserListVariant.Paginated }
					extended
					billingPeriod={ billingPeriod }
				/>
				{ pluginsPagination && (
					<Pagination
						page={ pluginsPagination.page }
						perPage={ SEARCH_RESULTS_LIST_LENGTH }
						total={ pluginsPagination.results }
						pageClick={ ( page ) => {
							dispatch( fetchPluginsList( null, page, searchTerm, SEARCH_RESULTS_LIST_LENGTH ) );
						} }
						variant={ PaginationVariant.minimal }
					/>
				) }
			</>
		);
	}

	return (
		<NoResults
			text={ translate( 'No plugins match your search for {{searchTerm/}}.', {
				textOnly: true,
				components: { searchTerm: <em>{ searchTerm }</em> },
			} ) }
		/>
	);
};

const translateCategory = ( { category, translate } ) => {
	switch ( category ) {
		case 'new':
			return translate( 'New', {
				context: 'Category description for the plugin browser.',
			} );
		case 'popular':
			return translate( 'Popular', {
				context: 'Category description for the plugin browser.',
			} );
		case 'featured':
			return translate( 'Featured', {
				context: 'Category description for the plugin browser.',
			} );
		case 'paid':
			return translate( 'Featured', {
				context: 'Category description for the plugin browser.',
			} );
	}
};

const FullListView = ( {
	category,
	isFetchingPluginsByCategory,
	pluginsByCategory,
	siteSlug,
	sites,
} ) => {
	const translate = useTranslate();

	if ( pluginsByCategory.length > 0 || isFetchingPluginsByCategory ) {
		return (
			<PluginsBrowserList
				plugins={ pluginsByCategory }
				listName={ category }
				title={ translateCategory( { category, translate } ) }
				site={ siteSlug }
				showPlaceholders={ isFetchingPluginsByCategory }
				currentSites={ sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				extended
			/>
		);
	}
};

const PluginSingleListView = ( {
	category,
	pluginsByCategoryNew,
	isFetchingPluginsByCategoryNew,
	pluginsByCategoryPopular,
	isFetchingPluginsByCategoryPopular,
	pluginsByCategoryFeatured,
	isFetchingPluginsByCategoryFeatured,
	paidPlugins,
	isFetchingPaidPlugins,
	siteSlug,
	sites,
	billingPeriod,
} ) => {
	const translate = useTranslate();

	let plugins;
	let isFetching;
	if ( category === 'new' ) {
		plugins = pluginsByCategoryNew;
		isFetching = isFetchingPluginsByCategoryNew;
	} else if ( category === 'popular' ) {
		plugins = pluginsByCategoryPopular;
		isFetching = isFetchingPluginsByCategoryPopular;
	} else if ( category === 'featured' ) {
		plugins = pluginsByCategoryFeatured;
		isFetching = isFetchingPluginsByCategoryFeatured;
	} else if ( category === 'paid' ) {
		plugins = paidPlugins;
		isFetching = isFetchingPaidPlugins;
	} else {
		return null;
	}

	const listLink = '/plugins/' + category + '/';
	return (
		<PluginsBrowserList
			plugins={ plugins.slice( 0, SHORT_LIST_LENGTH ) }
			listName={ category }
			title={ translateCategory( { category, translate } ) }
			site={ siteSlug }
			expandedListLink={ plugins.length > SHORT_LIST_LENGTH ? listLink : false }
			size={ SHORT_LIST_LENGTH }
			showPlaceholders={ isFetching }
			currentSites={ sites }
			variant={ PluginsBrowserListVariant.Fixed }
			billingPeriod={ billingPeriod }
			extended
		/>
	);
};

const PluginBrowserContent = ( props ) => {
	if ( props.search ) {
		return <SearchListView { ...props } />;
	}
	if ( props.category ) {
		return <FullListView { ...props } />;
	}

	return (
		<>
			{ isEnabled( 'marketplace-v1' ) && ! props.jetpackNonAtomic ? (
				<PluginSingleListView { ...props } category="paid" />
			) : (
				<PluginSingleListView { ...props } category="featured" />
			) }

			<PluginSingleListView { ...props } category="popular" />
			<PluginSingleListView { ...props } category="new" />
		</>
	);
};

const UpgradeNudge = ( {
	selectedSite,
	sitePlan,
	isVip,
	jetpackNonAtomic,
	hasBusinessPlan,
	siteSlug,
} ) => {
	const translate = useTranslate();

	if ( ! selectedSite?.ID || ! sitePlan || isVip || jetpackNonAtomic || hasBusinessPlan ) {
		return null;
	}

	const bannerURL = `/checkout/${ siteSlug }/business`;
	const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
		type: TYPE_BUSINESS,
	} );
	const title = translate( 'Upgrade to the Business plan to install plugins.' );

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			href={ bannerURL }
			feature={ FEATURE_UPLOAD_PLUGINS }
			plan={ plan }
			title={ title }
		/>
	);
};

const UploadPluginButton = ( { isMobile, siteSlug } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const uploadUrl = '/plugins/upload' + ( siteSlug ? '/' + siteSlug : '' );

	const handleUploadPluginButtonClick = () => {
		dispatch( recordTracksEvent( 'calypso_click_plugin_upload' ) );
		dispatch( recordGoogleEvent( 'Plugins', 'Clicked Plugin Upload Link' ) );
	};

	return (
		<Button
			className="plugins-browser__button"
			onClick={ handleUploadPluginButtonClick }
			href={ uploadUrl }
		>
			<Icon className="plugins-browser__button-icon" icon={ upload } width={ 18 } height={ 18 } />
			{ ! isMobile && (
				<span className="plugins-browser__button-text">{ translate( 'Upload' ) }</span>
			) }
		</Button>
	);
};

const SearchBox = ( { isMobile, doSearch, search } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const recordSearchEvent = ( eventName ) =>
		dispatch( recordGoogleEvent( 'PluginsBrowser', eventName ) );

	return (
		<WrappedSearch
			pinned={ isMobile }
			fitsContainer={ isMobile }
			onSearch={ doSearch }
			initialValue={ search }
			placeholder={ translate( 'Try searching ‘ecommerce’' ) }
			delaySearch={ true }
			recordEvent={ recordSearchEvent }
		/>
	);
};

const ManageButton = ( { shouldShowManageButton, siteAdminUrl, siteSlug, jetpackNonAtomic } ) => {
	const translate = useTranslate();

	if ( ! shouldShowManageButton ) {
		return null;
	}

	const site = siteSlug ? '/' + siteSlug : '';

	// When no site is selected eg `/plugins` or when Jetpack is self hosted
	// show the Calypso Plugins Manage page.
	// In any other case, redirect to current site WP Admin.
	const managePluginsDestination =
		! siteAdminUrl || jetpackNonAtomic
			? `/plugins/manage${ site }`
			: `${ siteAdminUrl }plugins.php`;

	return (
		<Button className="plugins-browser__button" href={ managePluginsDestination }>
			<span className="plugins-browser__button-text">{ translate( 'Manage plugins' ) }</span>
		</Button>
	);
};

const PageViewTrackerWrapper = ( { category, selectedSiteId, trackPageViews } ) => {
	const analyticsPageTitle = 'Plugin Browser' + category ? ` > ${ category }` : '';
	let analyticsPath = category ? `/plugins/${ category }` : '/plugins';

	if ( selectedSiteId ) {
		analyticsPath += '/:site';
	}

	if ( trackPageViews ) {
		return <PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />;
	}

	return null;
};

/**
 * Multiply the wpcom rating to match the wporg value.
 * wpcom rating is from 1 to 5 while wporg is from 1 to 100.
 *
 * @param plugin
 * @returns
 */
function updateWpComRating( plugin ) {
	if ( ! plugin || ! plugin.rating ) return plugin;

	plugin.rating *= 20;

	return plugin;
}

/**
 * Filter the popular plugins list.
 *
 * Remove the incompatible plugins and the displayed featured
 * plugins from the popular list to avoid showing them twice.
 *
 * @param {Array} popularPlugins
 * @param {Array} featuredPlugins
 */
function filterPopularPlugins( popularPlugins = [], featuredPlugins = [], jetpackNonAtomic ) {
	// when marketplace-v1 is enabled no featured plugins will be showed
	// since paid plugins will not be available for Jetpack self hosted sites,
	// continue with filtering the popular plugins.
	if ( isEnabled( 'marketplace-v1' ) && ! jetpackNonAtomic ) {
		featuredPlugins = [];
	}

	const displayedFeaturedSlugsMap = new Map(
		featuredPlugins
			.slice( 0, SHORT_LIST_LENGTH ) // only displayed plugins
			.map( ( plugin ) => [ plugin.slug, plugin.slug ] )
	);

	return popularPlugins.filter(
		( plugin ) =>
			! displayedFeaturedSlugsMap.has( plugin.slug ) && isCompatiblePlugin( plugin.slug )
	);
}

export default UrlSearch( PluginsBrowser );
