import {
	FEATURE_INSTALL_PLUGINS,
	findFirstSimilarPlanKey,
	TYPE_BUSINESS,
	TYPE_STARTER,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import announcementImage from 'calypso/assets/images/marketplace/diamond.svg';
import AnnouncementModal from 'calypso/blocks/announcement-modal';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import InfiniteScroll from 'calypso/components/infinite-scroll';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { setQueryArgs } from 'calypso/lib/query-args';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import NoResults from 'calypso/my-sites/no-results';
import { isEligibleForProPlan } from 'calypso/my-sites/plans-comparison';
import Categories from 'calypso/my-sites/plugins/categories';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import EducationFooter from 'calypso/my-sites/plugins/education-footer';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginsBrowserList from 'calypso/my-sites/plugins/plugins-browser-list';
import { PluginsBrowserListVariant } from 'calypso/my-sites/plugins/plugins-browser-list/types';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { getPlugins, isEqualSlugOrId } from 'calypso/state/plugins/installed/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import hasJetpackSites from 'calypso/state/selectors/has-jetpack-sites';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
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
import usePlugins from '../use-plugins';

/**
 * Module variables
 */
const SHORT_LIST_LENGTH = 6;

const PluginsBrowser = ( { trackPageViews = true, category, search, searchTitle, hideHeader } ) => {
	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();
	const searchRef = useRef( null );

	const clearSearch = useCallback( () => {
		searchRef?.current?.setKeyword( '' );
	}, [ searchRef ] );

	const breadcrumbs = useSelector( getBreadcrumbs );

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	const { plugins: paidPlugins = [], isFetching: isFetchingPaidPlugins } = usePlugins( {
		category: 'paid',
	} );

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
	const siteId = useSelector( getSelectedSiteId );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const hasUploadPlugins = useSelector(
		( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_UPLOAD_PLUGINS ) || jetpackNonAtomic
	);
	const hasManagePlugins = useSelector(
		( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS ) || jetpackNonAtomic
	);

	const {
		plugins: pluginsByCategoryFeatured = [],
		isFetching: isFetchingPluginsByCategoryFeatured,
	} = usePlugins( {
		category: 'featured',
	} );

	const { plugins: popularPlugins = [], isFetching: isFetchingPluginsByCategoryPopular } =
		usePlugins( {
			category: 'popular',
		} );

	const {
		plugins: pluginsBySearchTerm = [],
		isFetching: isFetchingPluginsBySearchTerm,
		pagination: pluginsPagination,
		fetchNextPage,
	} = usePlugins( {
		infinite: true,
		search,
		wpcomEnabled: !! search,
		wporgEnabled: !! search,
	} );

	const pluginsByCategoryPopular = filterPopularPlugins(
		popularPlugins,
		pluginsByCategoryFeatured
	);

	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite?.ID ) );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const isMobile = useBreakpoint( '<960px' );

	const shouldShowManageButton = useMemo( () => {
		if ( isJetpack ) {
			return true;
		}
		return ! selectedSite?.ID && hasJetpack;
	}, [ isJetpack, selectedSite, hasJetpack ] );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	useEffect( () => {
		if ( ! search ) {
			clearSearch();
		}
	}, [ clearSearch, search ] );

	useEffect( () => {
		const items = [
			{
				label: translate( 'Plugins' ),
				href: `/plugins/${ siteSlug || '' }`,
				id: 'plugins',
				helpBubble: translate(
					'Add new functionality and integrations to your site with plugins.'
				),
			},
		];

		if ( category ) {
			items.push( {
				label: categoryName,
				href: `/plugins/browse/${ category }/${ siteSlug || '' }`,
				id: 'category',
			} );
		}

		if ( search ) {
			items.push( {
				label: translate( 'Search Results' ),
				href: `/plugins/${ siteSlug || '' }?s=${ search }`,
				id: 'plugins-search',
			} );
		}

		dispatch( updateBreadcrumbs( items ) );
	}, [ siteSlug, search, category, categoryName, dispatch, translate ] );

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

	if ( ! isRequestingSitesData && noPermissionsError ) {
		return <NoPermissionsError title={ translate( 'Plugins', { textOnly: true } ) } />;
	}

	return (
		<MainComponent wideLayout>
			<QueryProductsList persist />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<PageViewTrackerWrapper
				category={ category }
				selectedSiteId={ selectedSite?.ID }
				trackPageViews={ trackPageViews }
			/>
			<DocumentHead title={ translate( 'Plugins' ) } />

			{ ! jetpackNonAtomic && (
				<AnnouncementModal
					announcementId="plugins-page-woo-extensions"
					pages={ annoncementPages }
					finishButtonText={ translate( "Let's explore!" ) }
				/>
			) }
			{ ! hideHeader && (
				<FixedNavigationHeader
					className="plugins-browser__header"
					navigationItems={ breadcrumbs }
					compactBreadcrumb={ isMobile }
					ref={ navigationHeaderRef }
				>
					<div className="plugins-browser__main-buttons">
						<ManageButton
							shouldShowManageButton={ shouldShowManageButton }
							siteAdminUrl={ siteAdminUrl }
							siteSlug={ siteSlug }
							jetpackNonAtomic={ jetpackNonAtomic }
							hasManagePlugins={ hasManagePlugins }
						/>

						<UploadPluginButton
							isMobile={ isMobile }
							siteSlug={ siteSlug }
							hasUploadPlugins={ hasUploadPlugins }
						/>
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

			<SearchBoxHeader
				searchRef={ searchRef }
				popularSearchesRef={ searchHeaderRef }
				isSticky={ isAboveElement }
				doSearch={ ( searchTerm ) => setQueryArgs( '' !== searchTerm ? { s: searchTerm } : {} ) }
				searchTerm={ search }
				isSearching={ isFetchingPluginsBySearchTerm }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			{ ! search && <Categories selected={ category } /> }

			<div className="plugins-browser__main-container">
				<PluginBrowserContent
					clearSearch={ clearSearch }
					pluginsByCategoryPopular={ pluginsByCategoryPopular }
					isFetchingPluginsByCategoryPopular={ isFetchingPluginsByCategoryPopular }
					isFetchingPluginsBySearchTerm={ isFetchingPluginsBySearchTerm }
					fetchNextPage={ fetchNextPage }
					pluginsBySearchTerm={ pluginsBySearchTerm }
					pluginsPagination={ pluginsPagination }
					pluginsByCategoryFeatured={ pluginsByCategoryFeatured }
					isFetchingPluginsByCategoryFeatured={ isFetchingPluginsByCategoryFeatured }
					search={ search }
					category={ category }
					paidPlugins={ paidPlugins }
					isFetchingPaidPlugins={ isFetchingPaidPlugins }
					sites={ sites }
					searchTitle={ searchTitle }
					siteSlug={ siteSlug }
					siteId={ siteId }
					jetpackNonAtomic={ jetpackNonAtomic }
					selectedSite={ selectedSite }
					sitePlan={ sitePlan }
					isVip={ isVip }
				/>
			</div>
			{ ! category && ! search && <EducationFooter /> }
		</MainComponent>
	);
};

const ClearSearch = () => {
	const siteSlug = useSelector( getSelectedSiteSlug );
	const translate = useTranslate();

	return (
		<>
			&nbsp;
			<a
				className={ 'plugins-browser__clear-filters' }
				href={ '/plugins' + ( siteSlug ? '/' + siteSlug : '' ) }
			>
				{ translate( 'Clear' ) }
			</a>
		</>
	);
};
const SearchListView = ( {
	search: searchTerm,
	pluginsPagination,
	pluginsBySearchTerm,
	fetchNextPage,
	isFetchingPluginsBySearchTerm,
	siteSlug,
	siteId,
	sites,
	categoryName,
} ) => {
	const dispatch = useDispatch();

	const translate = useTranslate();

	useEffect( () => {
		if ( searchTerm && pluginsPagination?.page === 1 ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_show', {
					search_term: searchTerm,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}

		if ( searchTerm && pluginsPagination ) {
			dispatch(
				recordTracksEvent( 'calypso_plugins_search_results_page', {
					search_term: searchTerm,
					page: pluginsPagination.page,
					results_count: pluginsPagination?.results,
					blog_id: siteId,
				} )
			);
		}
	}, [ searchTerm, pluginsPagination, dispatch, siteId ] );

	if ( pluginsBySearchTerm.length > 0 || isFetchingPluginsBySearchTerm ) {
		let title = translate( 'Search results for "%(searchTerm)s"', {
			textOnly: true,
			args: { searchTerm },
		} );

		if ( pluginsPagination ) {
			title = translate(
				'Found %(total)s plugin for "%(searchTerm)s"',
				'Found %(total)s plugins for "%(searchTerm)s"',
				{
					count: pluginsPagination.results,
					textOnly: true,
					args: {
						total: pluginsPagination.results,
						searchTerm,
					},
				}
			);

			if ( categoryName ) {
				title = translate(
					'Found %(total)s plugin for "%(searchTerm)s" under "%(categoryName)s"',
					'Found %(total)s plugins for "%(searchTerm)s" under "%(categoryName)s"',
					{
						count: pluginsPagination.results,
						textOnly: true,
						args: {
							total: pluginsPagination.results,
							searchTerm,
							categoryName,
						},
					}
				);
			}
		}

		return (
			<>
				<PluginsBrowserList
					plugins={ pluginsBySearchTerm.filter( isNotBlocked ) }
					listName={ 'plugins-browser-list__search-for_' + searchTerm.replace( /\s/g, '-' ) }
					subtitle={
						<>
							{ title }
							<ClearSearch />
						</>
					}
					showReset={ true }
					site={ siteSlug }
					showPlaceholders={ isFetchingPluginsBySearchTerm }
					currentSites={ sites }
					variant={ PluginsBrowserListVariant.Paginated }
					extended
				/>
				<InfiniteScroll nextPageMethod={ fetchNextPage } />
			</>
		);
	}

	return (
		<div className="plugins-browser__no-results">
			<NoResults
				text={ translate( 'No plugins match your search for {{searchTerm/}}.', {
					textOnly: true,
					components: { searchTerm: <em>{ searchTerm }</em> },
				} ) }
			/>
		</div>
	);
};

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
						<ClearSearch />
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

const PluginSingleListView = ( {
	category,
	pluginsByCategoryPopular,
	isFetchingPluginsByCategoryPopular,
	pluginsByCategoryFeatured,
	isFetchingPluginsByCategoryFeatured,
	paidPlugins,
	isFetchingPaidPlugins,
	siteSlug,
	sites,
} ) => {
	const translate = useTranslate();

	const siteId = useSelector( getSelectedSiteId );
	const domain = useSelector( ( state ) => getSiteDomain( state, siteId ) );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	const installedPlugins = useSelector( ( state ) =>
		getPlugins( state, siteObjectsToSiteIds( sites ) )
	);

	let plugins;
	let isFetching;
	if ( category === 'popular' ) {
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

	plugins = plugins
		.filter( isNotBlocked )
		.filter( ( plugin ) => isNotInstalled( plugin, installedPlugins ) );

	let listLink = '/plugins/browse/' + category;
	if ( domain ) {
		listLink = '/plugins/browse/' + category + '/' + domain;
	}

	if ( ! isFetching && plugins.length === 0 ) {
		return null;
	}

	return (
		<PluginsBrowserList
			plugins={ plugins.slice( 0, SHORT_LIST_LENGTH ) }
			listName={ category }
			title={ categoryName }
			site={ siteSlug }
			expandedListLink={ plugins.length > SHORT_LIST_LENGTH ? listLink : false }
			size={ SHORT_LIST_LENGTH }
			showPlaceholders={ isFetching }
			currentSites={ sites }
			variant={ PluginsBrowserListVariant.Fixed }
			extended
		/>
	);
};

const PluginBrowserContent = ( props ) => {
	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, props.selectedSite?.ID )
	);

	if ( props.search ) {
		return <SearchListView { ...props } />;
	}
	if ( props.category ) {
		return <FullListView { ...props } />;
	}

	return (
		<>
			{ ! props.jetpackNonAtomic && (
				<>
					<div className="plugins-browser__upgrade-banner">
						{ eligibleForProPlan ? (
							<UpgradeNudgePaid { ...props } />
						) : (
							<UpgradeNudge { ...props } />
						) }
					</div>
					<PluginSingleListView { ...props } category="paid" />
				</>
			) }
			{ eligibleForProPlan && <UpgradeNudge { ...props } /> }
			<PluginSingleListView { ...props } category="featured" />
			<PluginSingleListView { ...props } category="popular" />
		</>
	);
};

const UpgradeNudge = ( { selectedSite, sitePlan, isVip, jetpackNonAtomic, siteSlug } ) => {
	const translate = useTranslate();
	const eligibleForProPlan = useSelector( ( state ) =>
		isEligibleForProPlan( state, selectedSite?.ID )
	);

	if ( ! selectedSite?.ID || ! sitePlan || isVip || jetpackNonAtomic ) {
		return null;
	}

	const checkoutPlan = eligibleForProPlan ? 'pro' : 'business';
	const bannerURL = `/checkout/${ siteSlug }/${ checkoutPlan }`;
	const plan = findFirstSimilarPlanKey( sitePlan.product_slug, {
		type: TYPE_BUSINESS,
	} );

	const title = eligibleForProPlan
		? translate( 'Upgrade to the Pro plan to install plugins.' )
		: translate( 'Upgrade to the Business plan to install plugins.' );

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			href={ bannerURL }
			feature={ FEATURE_INSTALL_PLUGINS }
			plan={ plan }
			title={ title }
		/>
	);
};

const UpgradeNudgePaid = ( props ) => {
	const translate = useTranslate();
	const plan = findFirstSimilarPlanKey( props.sitePlan.product_slug, {
		type: TYPE_STARTER,
	} );

	return (
		<UpsellNudge
			event="calypso_plugins_browser_upgrade_nudge"
			showIcon={ true }
			//		href={ `/checkout/${ props.siteSlug }/starter` }
			feature={ WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS }
			plan={ plan }
			title={ translate( 'Upgrade to the Starter plan to install paid plugins.' ) }
		/>
	);
};

const UploadPluginButton = ( { isMobile, siteSlug, hasUploadPlugins } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	if ( ! hasUploadPlugins ) {
		return null;
	}

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

const ManageButton = ( {
	shouldShowManageButton,
	siteAdminUrl,
	siteSlug,
	jetpackNonAtomic,
	hasManagePlugins,
} ) => {
	const translate = useTranslate();

	if ( ! shouldShowManageButton || ! hasManagePlugins ) {
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
	let analyticsPath = category ? `/plugins/browse/${ category }` : '/plugins';

	if ( selectedSiteId ) {
		analyticsPath += '/:site';
	}

	if ( trackPageViews ) {
		return <PageViewTracker path={ analyticsPath } title={ analyticsPageTitle } />;
	}

	return null;
};

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

const PLUGIN_SLUGS_BLOCKLIST = [];

function isNotBlocked( plugin ) {
	return PLUGIN_SLUGS_BLOCKLIST.indexOf( plugin.slug ) === -1;
}

/**
 * Returns a boolean indicating if a plugin is already installed or not
 *
 * @param plugin plugin object to be tested
 * @param installedPlugins list of installed plugins aggregated by plugin slug
 * @returns Boolean weather a plugin is not installed on not
 */
function isNotInstalled( plugin, installedPlugins ) {
	return ! installedPlugins.find( ( installedPlugin ) =>
		isEqualSlugOrId( plugin.slug, installedPlugin )
	);
}

export default PluginsBrowser;
