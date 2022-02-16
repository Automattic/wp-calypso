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
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/diamond.svg';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QueryWporgPlugins from 'calypso/components/data/query-wporg-plugins';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import Pagination from 'calypso/components/pagination';
import { PaginationVariant } from 'calypso/components/pagination/constants';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import UrlSearch from 'calypso/lib/url-search';
import NoResults from 'calypso/my-sites/no-results';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { setBillingInterval } from 'calypso/state/marketplace/billing-interval/actions';
import { getBillingInterval } from 'calypso/state/marketplace/billing-interval/selectors';
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
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import {
	getSitePlan,
	isJetpackSite,
	isRequestingSites,
	getSiteAdminUrl,
	getSiteDomain,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';

import './style.scss';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;
const SEARCH_RESULTS_LIST_LENGTH = 12;

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
			return translate( 'Premium', {
				context: 'Category description for the plugin browser.',
			} );
		default:
			return translate( 'Plugins', {
				context: 'Category description for the plugin browser.',
			} );
	}
};

const PluginsBrowser = ( {
	trackPageViews = true,
	category,
	search,
	searchTitle,
	hideHeader,
	doSearch,
} ) => {
	const breadcrumbs = useSelector( getBreadcrumbs );

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	// Billing period switcher.
	const billingPeriod = useSelector( getBillingInterval );

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
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSite?.ID )
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
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const pluginsByCategory = useSelector( ( state ) => getPluginsListByCategory( state, category ) );
	const pluginsByCategoryNew = useSelector( ( state ) => getPluginsListByCategory( state, 'new' ) );
	const pluginsByCategoryFeatured = useSelector( ( state ) =>
		getPluginsListByCategory( state, 'featured' )
	);
	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		pluginsByCategoryFeatured
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

	useEffect( () => {
		const items = [
			{ label: translate( 'Plugins' ), href: `/plugins/${ siteSlug || '' }`, id: 'plugins' },
		];
		if ( search ) {
			items.push( {
				label: translate( 'Search Results' ),
				href: `/plugins/${ siteSlug || '' }?s=${ search }`,
				id: 'plugins-search',
			} );
		}
		if ( category ) {
			items.push( {
				label: translateCategory( { category, translate } ),
				href: `/plugins/${ category }/${ siteSlug || '' }`,
				id: 'category',
			} );
		}

		dispatch( updateBreadcrumbs( items ) );
	}, [ siteSlug, search, category ] );

	const trackSiteDisconnect = () =>
		composeAnalytics(
			recordGoogleEvent( 'Jetpack', 'Clicked in site indicator to start Jetpack Disconnect flow' ),
			recordTracksEvent( 'calypso_jetpack_site_indicator_disconnect_start' )
		);
	const annoncementPages = [
		{
			headline: translate( 'NEW' ),
			heading: translate( 'Buy the best plugins' ),
			content: translate(
				"Now you can purchase plugins right on WordPress.com to extend your website's capabilities."
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
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PageViewTrackerWrapper
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />
			<SidebarNavigation />

			{ ! jetpackNonAtomic && (
				<AnnouncementModal
					announcementId="plugins-page-woo-extensions"
					pages={ annoncementPages }
					finishButtonText={ translate( "Let's explore!" ) }
				/>
			) }
			{ ! hideHeader && (
				<FixedNavigationHeader className="plugins-browser__header" navigationItems={ breadcrumbs }>
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
			{ isSiteConnected === false && (
				<Notice
					icon="notice"
					showDismiss={ false }
					status="is-warning"
					text={ translate( '%(siteName)s cannot be accessed.', {
						textOnly: true,
						args: { siteName: selectedSite.title },
					} ) }
				>
					<NoticeAction
						onClick={ trackSiteDisconnect }
						href={ `/settings/disconnect-site/${ selectedSite.slug }?type=down` }
					>
						{ translate( 'I’d like to fix this now' ) }
					</NoticeAction>
				</Notice>
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
				pluginsByCategory={ pluginsByCategory }
				isFetchingPluginsByCategory={ isFetchingPluginsByCategory }
				paidPlugins={ paidPlugins }
				isFetchingPaidPlugins={ isFetchingPaidPlugins }
				sites={ sites }
				searchTitle={ searchTitle }
				siteSlug={ siteSlug }
				jetpackNonAtomic={ jetpackNonAtomic }
				billingPeriod={ billingPeriod }
				setBillingPeriod={ ( interval ) => dispatch( setBillingInterval( interval ) ) }
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
				count: pluginsPagination.results + paidPluginsBySearchTerm?.length,
				textOnly: true,
				args: {
					total: pluginsPagination.results + paidPluginsBySearchTerm?.length,
				},
			} );

		let pageSize = SEARCH_RESULTS_LIST_LENGTH;
		if ( pluginsPagination?.page === 1 ) {
			// Paid results appear only in the first page.
			// Since the wporg results will always be an even number and paid results might be odd
			// append one more wporg result if needed to fill the grid.
			pageSize =
				SEARCH_RESULTS_LIST_LENGTH +
				paidPluginsBySearchTerm?.length +
				( paidPluginsBySearchTerm?.length % 2 );
		}

		const pluginItemsFeatch = ( page ) => {
			return page === 1
				? SEARCH_RESULTS_LIST_LENGTH + ( paidPluginsBySearchTerm?.length % 2 )
				: SEARCH_RESULTS_LIST_LENGTH;
		};

		return (
			<>
				<PluginsBrowserList
					plugins={
						pluginsPagination?.page === 1
							? [ ...paidPluginsBySearchTerm, ...pluginsBySearchTerm ]
							: pluginsBySearchTerm
					}
					listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
					title={ searchTitle }
					subtitle={ subtitle }
					site={ siteSlug }
					showPlaceholders={ isFetchingPluginsBySearchTerm || isFetchingPaidPluginsBySearchTerm }
					size={ pageSize }
					currentSites={ sites }
					variant={ PluginsBrowserListVariant.Paginated }
					extended
					billingPeriod={ billingPeriod }
				/>
				{ pluginsPagination && (
					<Pagination
						page={ pluginsPagination.page }
						perPage={ pluginItemsFeatch( pluginsPagination?.page ) }
						total={ pluginsPagination.results }
						pageClick={ ( page ) => {
							dispatch( fetchPluginsList( null, page, searchTerm, pluginItemsFeatch( page ) ) );
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

const FullListView = ( {
	category,
	isFetchingPluginsByCategory,
	pluginsByCategory,
	siteSlug,
	sites,
	paidPlugins,
	isFetchingPaidPlugins,
	billingPeriod,
	setBillingPeriod,
} ) => {
	const translate = useTranslate();

	let plugins = pluginsByCategory;
	let isFetching = isFetchingPluginsByCategory;
	if ( category === 'paid' ) {
		plugins = paidPlugins;
		isFetching = isFetchingPaidPlugins;
	}

	if ( plugins.length > 0 || isFetching ) {
		return (
			<PluginsBrowserList
				plugins={ plugins }
				listName={ category }
				title={ translateCategory( { category, translate } ) }
				site={ siteSlug }
				showPlaceholders={ isFetching }
				currentSites={ sites }
				variant={ PluginsBrowserListVariant.InfiniteScroll }
				billingPeriod={ billingPeriod }
				setBillingPeriod={ category === 'paid' && setBillingPeriod }
				extended
			/>
		);
	}

	// todo: this shouldn't ever render but we can't return void/null here.
	return (
		<NoResults
			text={ translate( 'No plugins available.', {
				textOnly: true,
			} ) }
		/>
	);
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
	setBillingPeriod,
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

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

	let listLink = '/plugins/' + category;
	if ( domain ) {
		listLink = '/plugins/' + category + '/' + domain;
	}
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
			setBillingPeriod={ category === 'paid' && setBillingPeriod }
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
			{ ! props.jetpackNonAtomic ? (
				<>
					<PluginSingleListView { ...props } category="paid" />
					<PluginSingleListView { ...props } category="featured" />
				</>
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
			<span className="plugins-browser__button-text">{ translate( 'Installed Plugins' ) }</span>
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
function filterPopularPlugins( popularPlugins = [], featuredPlugins = [] ) {
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
