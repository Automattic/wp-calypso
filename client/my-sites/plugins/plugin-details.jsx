import { Button } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { useBreakpoint } from '@automattic/viewport-react';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import MainComponent from 'calypso/components/main';
import NavigationHeader from 'calypso/components/navigation-header';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useESPlugin } from 'calypso/data/marketplace/use-es-query';
import { useMarketplaceReviewsQuery } from 'calypso/data/marketplace/use-marketplace-reviews';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { MarketplaceReviewsCards } from 'calypso/my-sites/marketplace/components/reviews-cards';
import { ReviewsModal } from 'calypso/my-sites/marketplace/components/reviews-modal';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginDetailsCTA from 'calypso/my-sites/plugins/plugin-details-CTA';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginDetailsNotices from 'calypso/my-sites/plugins/plugin-details-notices';
import PluginDetailsSidebar from 'calypso/my-sites/plugins/plugin-details-sidebar';
import PluginDetailsV2 from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2';
import PluginNotFound from 'calypso/my-sites/plugins/plugin-not-found';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';
import { RelatedPlugins } from 'calypso/my-sites/plugins/related-plugins';
import {
	siteObjectsToSiteIds,
	useLocalizedPlugins,
	useServerEffect,
} from 'calypso/my-sites/plugins/utils';
import {
	composeAnalytics,
	recordGoogleEvent,
	recordTracksEvent,
} from 'calypso/state/analytics/actions';
import { appendBreadcrumb } from 'calypso/state/breadcrumb/actions';
import { getBreadcrumbs } from 'calypso/state/breadcrumb/selectors';
import { getCurrentUserId, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canPublishProductReviews } from 'calypso/state/marketplace/selectors';
import {
	getPluginOnSites,
	isRequestingForAllSites,
} from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetchingSelector,
	isFetched as isWporgPluginFetchedSelector,
	hasError as isWporgPluginErrorSelector,
	getPlugin as getWporgPluginSelector,
} from 'calypso/state/plugins/wporg/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
	isSaasProduct as isSaasProductSelector,
} from 'calypso/state/products-list/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import getPreviousRoute from 'calypso/state/selectors/get-previous-route';
import getSelectedOrAllSites from 'calypso/state/selectors/get-selected-or-all-sites';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	isJetpackSite,
	isRequestingSites as checkRequestingSites,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { MarketplaceFooter } from './education-footer';
import NoPermissionsError from './no-permissions-error';
import { usePluginIsMaintained } from './use-plugin-is-maintained';

function PluginDetails( props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	// Site information.
	const selectedSite = useSelector( getSelectedSite );
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const selectedOrAllSites = useSelector( getSelectedOrAllSites );
	const isRequestingSites = useSelector( checkRequestingSites );
	const requestingPluginsForSites = useSelector( isRequestingForAllSites );
	const analyticsPath = selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { localizePath } = useLocalizedPlugins();

	// Plugin information.
	const PREMIUM_SLUG_FIELD = 'plugin.premium_slug';
	const { data: esPlugin = {} } = useESPlugin( props.pluginSlug, [ PREMIUM_SLUG_FIELD ] );
	const plugin = useSelector( ( state ) => getPluginOnSites( state, siteIds, props.pluginSlug ) );
	const wporgPlugin = useSelector( ( state ) => getWporgPluginSelector( state, props.pluginSlug ) );
	const isWporgPluginFetching = useSelector( ( state ) =>
		isWporgPluginFetchingSelector( state, props.pluginSlug )
	);
	const isWporgPluginFetched = useSelector( ( state ) =>
		isWporgPluginFetchedSelector( state, props.pluginSlug )
	);
	const wporgPluginError = useSelector( ( state ) =>
		isWporgPluginErrorSelector( state, props.pluginSlug )
	);
	const wporgPluginNotFound = wporgPluginError?.response?.status === 404;
	const userCanManagePlugins = useSelector(
		( state ) =>
			! selectedSite ||
			( selectedSite?.ID
				? canCurrentUser( state, selectedSite?.ID, 'manage_options' )
				: canCurrentUserManagePlugins( state ) )
	);
	const [ isReviewsModalVisible, setIsReviewsModalVisible ] = useState( false );

	// Site type.
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isWpcom = selectedSite && ! isJetpack;
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;
	const isSiteConnected = useSelector( ( state ) =>
		getSiteConnectionStatus( state, selectedSite?.ID )
	);
	const trackSiteDisconnect = () =>
		composeAnalytics(
			recordGoogleEvent( 'Jetpack', 'Clicked in site indicator to start Jetpack Disconnect flow' ),
			recordTracksEvent( 'calypso_jetpack_site_indicator_disconnect_start' )
		);

	// Header Navigation and billing period switcher.
	const isWide = useBreakpoint( '>960px' );

	// Determine if the plugin is WPcom or WPorg hosted
	const productsList = useSelector( getProductsList );
	const isProductListFetched = Object.values( productsList ).length > 0;

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, props.pluginSlug )
	);

	const isSaasProduct = useSelector( ( state ) =>
		isSaasProductSelector( state, props.pluginSlug )
	);

	const isIncompatiblePlugin = useMemo( () => {
		return ! isCompatiblePlugin( props.pluginSlug ) && ! isJetpackSelfHosted;
	}, [ isJetpackSelfHosted, props.pluginSlug ] );

	const isIncompatibleBackupPlugin = useMemo( () => {
		return 'vaultpress' === props.pluginSlug && ! isJetpackSelfHosted;
	}, [ isJetpackSelfHosted, props.pluginSlug ] );

	// Fetch WPorg plugin data if needed
	useEffect( () => {
		if ( isProductListFetched && ! isMarketplaceProduct && ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( props.pluginSlug, translate.localeSlug ) );
		}
	}, [
		isProductListFetched,
		isMarketplaceProduct,
		isWporgPluginFetched,
		props.pluginSlug,
		dispatch,
		translate.localeSlug,
	] );

	// Fetch WPcom plugin data if needed
	const {
		data: wpComPluginData,
		isFetched: isWpComPluginFetched,
		isFetching: isWpComPluginFetching,
	} = useWPCOMPlugin( props.pluginSlug, { enabled: isProductListFetched && isMarketplaceProduct } );

	// Unify plugin details
	const fullPlugin = useMemo( () => {
		const wpcomPlugin = {
			...wpComPluginData,
			fetched: isWpComPluginFetched,
		};
		return {
			...esPlugin,
			...wpcomPlugin,
			...wporgPlugin,
			...plugin,
			fetched: wpcomPlugin?.fetched || wporgPlugin?.fetched,
			isMarketplaceProduct,
			isSaasProduct,
		};
	}, [
		plugin,
		esPlugin,
		wporgPlugin,
		wpComPluginData,
		isWpComPluginFetched,
		isMarketplaceProduct,
		isSaasProduct,
	] );

	const existingPlugin = useMemo( () => {
		if (
			( ! isMarketplaceProduct &&
				( isWporgPluginFetching || ( ! isWporgPluginFetched && ! wporgPluginError ) ) ) ||
			( isMarketplaceProduct && ( isWpComPluginFetching || ! isWpComPluginFetched ) )
		) {
			return 'unknown';
		}
		if ( fullPlugin && fullPlugin.fetched ) {
			return true;
		}

		// If the plugin has at least one site then we know it exists
		const pluginSites = fullPlugin?.sites ? Object.values( fullPlugin.sites ) : [];
		if ( pluginSites && pluginSites[ 0 ] ) {
			return true;
		}

		if ( requestingPluginsForSites ) {
			return 'unknown';
		}

		return false;
	}, [
		isMarketplaceProduct,
		isWpComPluginFetching,
		isWpComPluginFetched,
		isWporgPluginFetching,
		isWporgPluginFetched,
		wporgPluginError,
		fullPlugin,
		requestingPluginsForSites,
	] );

	const canPublishReview = useSelector( ( state ) =>
		canPublishProductReviews( state, 'plugin', fullPlugin.slug, fullPlugin.variations )
	);
	const currentUserId = useSelector( getCurrentUserId );
	const { data: userReviews = [] } = useMarketplaceReviewsQuery( {
		productType: 'plugin',
		slug: fullPlugin.slug,
		perPage: 1,
		author: currentUserId ?? undefined,
		status: 'all',
	} );

	const setBreadcrumbs = ( breadcrumbs = [] ) => {
		if ( breadcrumbs?.length === 0 ) {
			dispatch(
				appendBreadcrumb( {
					label: translate( 'Plugins' ),
					href: localizePath( `/plugins/${ selectedSite?.slug || '' }` ),
					id: 'plugins',
				} )
			);
		}

		if ( fullPlugin.name && props.pluginSlug ) {
			dispatch(
				appendBreadcrumb( {
					label:
						fullPlugin.name.length > 50 ? `${ fullPlugin.name.slice( 0, 50 ) }…` : fullPlugin.name,
					href: localizePath( `/plugins/${ props.pluginSlug }/${ selectedSite?.slug || '' }` ),
					id: `plugin-${ props.pluginSlug }`,
				} )
			);
		}
	};

	const previousRoute = useSelector( getPreviousRoute );
	useEffect( () => {
		/* If translatations change, reset and update the breadcrumbs */
		if ( ! previousRoute ) {
			setBreadcrumbs();
		}
	}, [ translate ] );

	useServerEffect( () => {
		setBreadcrumbs();
	} );

	/* We need to get the breadcrumbs after the server has set them */
	const breadcrumbs = useSelector( getBreadcrumbs );

	useEffect( () => {
		setBreadcrumbs( breadcrumbs );
	}, [ fullPlugin.name, props.pluginSlug, selectedSite, dispatch, localizePath ] );

	const isMaintained = usePluginIsMaintained( fullPlugin?.tested );

	const getPageTitle = () => {
		return translate( '%(pluginName)s Plugin', {
			args: { pluginName: fullPlugin.name },
			textOnly: true,
			context: 'Page title: Plugin detail',
		} );
	};

	if ( ! isRequestingSites && ! userCanManagePlugins ) {
		return <NoPermissionsError title={ getPageTitle() } />;
	}

	if ( existingPlugin === false ) {
		return <PluginNotFound />;
	}

	const showPlaceholder = existingPlugin === 'unknown';

	if ( props.isJetpackCloud ) {
		return (
			<PluginDetailsV2
				showPlaceholder={ showPlaceholder }
				selectedSite={ selectedSite }
				fullPlugin={ fullPlugin }
				sitesWithPlugins={ sitesWithPlugins }
				isMarketplaceProduct={ isMarketplaceProduct }
				isWpcom={ isWpcom }
				{ ...props }
			/>
		);
	}

	const downloadText = translate(
		'This plugin is {{org_link}}available for download{{/org_link}} to be used on your {{wpcom_vs_wporg_link}}WordPress self-hosted{{/wpcom_vs_wporg_link}} installation.',
		{
			components: {
				org_link: (
					<a
						href={ 'https://wordpress.org/plugins/' + ( fullPlugin?.slug || '' ) }
						target="_blank"
						rel="noreferrer noopener"
					/>
				),
				wpcom_vs_wporg_link: (
					<a
						href={ localizeUrl(
							'https://wordpress.com/go/website-building/wordpress-com-vs-wordpress-org/'
						) }
						target="_blank"
						rel="noreferrer noopener"
					/>
				),
			},
		}
	);

	const structuredData = JSON.stringify( {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: fullPlugin?.name,
		sameAs: 'https://wordpress.org/plugins/' + ( fullPlugin?.slug || '' ),
	} );

	return (
		<MainComponent className="is-plugin-details" wideLayout isLoggedOut={ ! isLoggedIn }>
			<DocumentHead title={ getPageTitle() } />
			<PageViewTracker
				path={ analyticsPath }
				title="Plugins > Plugin Details"
				properties={ { is_logged_in: isLoggedIn, plugin_slug: props.pluginSlug } }
			/>
			<QueryPlugins siteId={ selectedSite?.ID } />
			<QueryEligibility siteId={ selectedSite?.ID } />
			<QuerySiteFeatures siteIds={ selectedOrAllSites.map( ( site ) => site.ID ) } />
			<QueryProductsList persist={ ! wporgPluginNotFound } />
			<QueryUserPurchases />
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<NavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ breadcrumbs } />
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ selectedOrAllSites }
				plugins={ [ fullPlugin ] }
			/>
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
			<ReviewsModal
				isVisible={ isReviewsModalVisible }
				onClose={ () => setIsReviewsModalVisible( false ) }
				productName={ fullPlugin.name }
				slug={ fullPlugin.slug }
				variations={ fullPlugin.variations }
				productType="plugin"
			/>
			<PluginDetailsNotices selectedSite={ selectedSite } plugin={ fullPlugin } />

			{ userReviews.length === 0 &&
				canPublishReview &&
				isMarketplaceProduct &&
				! showPlaceholder && (
					<Banner
						className="plugin-details__reviews-banner"
						title={ translate( 'Review this plugin!' ) }
						description={ translate(
							'Please help other users by sharing your experience with this plugin.'
						) }
						onClick={ () => setIsReviewsModalVisible( true ) }
						disableHref
						event="calypso_marketplace_reviews_plugin_banner"
					/>
				) }
			<div className="plugin-details__page">
				<div className={ clsx( 'plugin-details__layout', { 'is-logged-in': isLoggedIn } ) }>
					<div className="plugin-details__header">
						<PluginDetailsHeader
							plugin={ fullPlugin }
							isPlaceholder={ showPlaceholder }
							onReviewsClick={ () => setIsReviewsModalVisible( true ) }
							isMarketplaceProduct={ isMarketplaceProduct }
						/>
					</div>
					<div className="plugin-details__content">
						{ ! showPlaceholder && (
							<div className="plugin-details__body">
								{ ! isJetpackSelfHosted && isIncompatiblePlugin && ! isIncompatibleBackupPlugin && (
									<Notice
										text={ translate(
											'Incompatible plugin: This plugin is not supported on WordPress.com.'
										) }
										status="is-warning"
										showDismiss={ false }
									>
										<NoticeAction
											href={ localizeUrl( 'https://wordpress.com/support/incompatible-plugins/' ) }
										>
											{ translate( 'More info' ) }
										</NoticeAction>
									</Notice>
								) }

								{ isIncompatibleBackupPlugin && (
									<Notice
										text={ translate(
											'Incompatible plugin: You site plan already includes Jetpack VaultPress Backup.'
										) }
										status="is-warning"
										showDismiss={ false }
									>
										<NoticeAction href={ `/backup/${ selectedSite.slug }` }>
											{ translate( 'View backups' ) }
										</NoticeAction>
									</Notice>
								) }

								{ ! isMaintained && (
									<Notice showDismiss={ false } status="is-warning">
										{ translate(
											'This plugin {{strong}}hasn’t been tested with the latest 3 major releases of WordPress{{/strong}}. It may no longer be maintained or supported and may have compatibility issues when used with more recent versions of WordPress. Try {{a}}searching{{/a}} for a similar plugin.',
											{
												components: {
													a: <a href={ `/plugins/${ selectedSite?.slug ?? '' }` } />,
													strong: <strong />,
												},
											}
										) }
									</Notice>
								) }

								{ fullPlugin.wporg || isMarketplaceProduct ? (
									<PluginSections plugin={ fullPlugin } isWpcom={ isWpcom } addBanner />
								) : (
									<PluginSectionsCustom plugin={ fullPlugin } />
								) }
								<RelatedPlugins
									slug={ props.pluginSlug }
									seeAllLink={ `/plugins/${ props.pluginSlug }/related/${
										selectedSite?.slug ?? ''
									}` }
								/>
							</div>
						) }
					</div>

					<div className="plugin-details__actions">
						<div className="plugin-details__sidebar">
							<PluginDetailsCTA plugin={ fullPlugin } isPlaceholder={ showPlaceholder } />

							{ ! showPlaceholder && ! requestingPluginsForSites && (
								<PluginDetailsSidebar plugin={ fullPlugin } />
							) }
						</div>

						{ ! showPlaceholder && ! requestingPluginsForSites && isWporgPluginFetched && (
							<div className="plugin-details__plugin-download">
								<div className="plugin-details__plugin-download-text">
									<span>{ downloadText }</span>
								</div>
								<div className="plugin-details__plugin-download-cta">
									<Button
										href={ `https://downloads.wordpress.org/plugin/${
											fullPlugin?.slug || ''
										}.latest-stable.zip` }
										rel="nofollow"
									>
										{ translate( 'Download' ) }
									</Button>
								</div>
								<script type="application/ld+json">{ structuredData }</script>
							</div>
						) }
					</div>
				</div>
			</div>
			{ ! showPlaceholder && (
				<div className="plugin-details__reviews">
					<MarketplaceReviewsCards
						slug={ fullPlugin.slug }
						productType="plugin"
						showMarketplaceReviews={ () => setIsReviewsModalVisible( true ) }
					/>
				</div>
			) }
			{ isMarketplaceProduct && ! showPlaceholder && <MarketplaceFooter /> }
		</MainComponent>
	);
}

export default PluginDetails;
