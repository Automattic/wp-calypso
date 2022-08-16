import {
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
	WPCOM_FEATURES_MANAGE_PLUGINS,
	WPCOM_FEATURES_UPLOAD_PLUGINS,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useBreakpoint } from '@automattic/viewport-react';
import { Icon, upload } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import useScrollAboveElement from 'calypso/lib/use-scroll-above-element';
import Categories from 'calypso/my-sites/plugins/categories';
import { useCategories } from 'calypso/my-sites/plugins/categories/use-categories';
import EducationFooter from 'calypso/my-sites/plugins/education-footer';
import NoPermissionsError from 'calypso/my-sites/plugins/no-permissions-error';
import PluginsAnnouncementModal from 'calypso/my-sites/plugins/plugins-announcement-modal';
import SearchBoxHeader from 'calypso/my-sites/plugins/search-box-header';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import {
	recordTracksEvent,
	recordGoogleEvent,
	composeAnalytics,
} from 'calypso/state/analytics/actions';
import { updateBreadcrumbs } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSelectedOrAllSitesJetpackCanManage from 'calypso/state/selectors/get-selected-or-all-sites-jetpack-can-manage';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import {
	getSitePlan,
	isJetpackSite,
	isRequestingSites,
	getSiteAdminUrl,
} from 'calypso/state/sites/selectors';
import {
	getSelectedSiteId,
	getSelectedSite,
	getSelectedSiteSlug,
} from 'calypso/state/ui/selectors';
import PluginsCategoryResultsPage from '../plugins-category-results-page';
import PluginsDiscoveryPage from '../plugins-discovery-page';
import PluginsSearchResultPage from '../plugins-search-results-page';

import './style.scss';

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

	if ( ! shouldShowManageButton ) {
		return null;
	}

	const site = siteSlug ? '/' + siteSlug : '';

	// When no site is selected eg `/plugins` or when Jetpack is self hosted
	// or if the site does not have the manage plugins feature show the
	// Calypso Plugins Manage page.
	// In any other case, redirect to current site WP Admin.
	const managePluginsDestination =
		! siteAdminUrl || jetpackNonAtomic || ! hasManagePlugins
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

const PluginsBrowser = ( { trackPageViews = true, category, search, hideHeader } ) => {
	const {
		isAboveElement,
		targetRef: searchHeaderRef,
		referenceRef: navigationHeaderRef,
	} = useScrollAboveElement();
	const searchRef = useRef( null );
	//  another temporary solution until phase 4 is merged
	const [ isFetchingPluginsBySearchTerm, setIsFetchingPluginsBySearchTerm ] = useState( false );

	const breadcrumbs = useSelector( getBreadcrumbs );

	const selectedSite = useSelector( getSelectedSite );
	const sitePlan = useSelector( ( state ) => getSitePlan( state, selectedSite?.ID ) );

	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const jetpackNonAtomic = useSelector(
		( state ) =>
			isJetpackSite( state, selectedSite?.ID ) && ! isAtomicSite( state, selectedSite?.ID )
	);
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSite?.ID )
	);
	const isVip = useSelector( ( state ) => isVipSite( state, selectedSite?.ID ) );
	const isRequestingSitesData = useSelector( isRequestingSites );
	const noPermissionsError = useSelector(
		( state ) =>
			!! selectedSite?.ID && ! canCurrentUser( state, selectedSite?.ID, 'manage_options' )
	);
	const siteSlug = useSelector( getSelectedSiteSlug );
	const siteId = useSelector( getSelectedSiteId );
	const sites = useSelector( getSelectedOrAllSitesJetpackCanManage );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const hasInstallPurchasedPlugins = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS )
	);
	const hasManagePlugins = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS )
	);
	const hasUploadPlugins = useSelector(
		( state ) => siteHasFeature( state, siteId, WPCOM_FEATURES_UPLOAD_PLUGINS ) || jetpackNonAtomic
	);

	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, selectedSite?.ID ) );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const isMobile = useBreakpoint( '<960px' );

	const shouldShowManageButton = useMemo( () => {
		return jetpackNonAtomic || ( isJetpack && ( hasInstallPurchasedPlugins || hasManagePlugins ) );
	}, [ jetpackNonAtomic, isJetpack, hasInstallPurchasedPlugins, hasManagePlugins ] );

	const categories = useCategories();
	const categoryName = categories[ category ]?.name || translate( 'Plugins' );

	// this is a temporary hack until we merge Phase 4 of the refactor
	const renderList = () => {
		if ( search ) {
			return (
				<PluginsSearchResultPage
					search={ search }
					setIsFetchingPluginsBySearchTerm={ setIsFetchingPluginsBySearchTerm }
					siteSlug={ siteSlug }
					siteId={ siteId }
					sites={ sites }
				/>
			);
		}

		if ( category ) {
			return (
				<PluginsCategoryResultsPage category={ category } sites={ sites } siteSlug={ siteSlug } />
			);
		}

		return (
			<PluginsDiscoveryPage
				siteSlug={ siteSlug }
				jetpackNonAtomic={ jetpackNonAtomic }
				selectedSite={ selectedSite }
				sitePlan={ sitePlan }
				isVip={ isVip }
				sites={ sites }
			/>
		);
	};

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

			<PluginsAnnouncementModal />
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
				searchTerm={ search }
				isSearching={ isFetchingPluginsBySearchTerm }
				title={ translate( 'Plugins you need to get your projects done' ) }
				searchTerms={ [ 'seo', 'pay', 'booking', 'ecommerce', 'newsletter' ] }
			/>

			{ ! search && <Categories selected={ category } /> }
			<div className="plugins-browser__main-container">{ renderList() }</div>
			{ ! category && ! search && <EducationFooter /> }
		</MainComponent>
	);
};

export default PluginsBrowser;
