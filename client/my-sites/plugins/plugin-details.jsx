import { useBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryPlugins from 'calypso/components/data/query-plugins';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySiteFeatures from 'calypso/components/data/query-site-features';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import InlineSupportLink from 'calypso/components/inline-support-link';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useESPlugin } from 'calypso/data/marketplace/use-es-query';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginDetailsCTA from 'calypso/my-sites/plugins/plugin-details-CTA';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginDetailsNotices from 'calypso/my-sites/plugins/plugin-details-notices';
import PluginDetailsSidebar from 'calypso/my-sites/plugins/plugin-details-sidebar';
import PluginDetailsV2 from 'calypso/my-sites/plugins/plugin-management-v2/plugin-details-v2';
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
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
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
	const requestingPluginsForSites = useSelector( ( state ) => isRequestingForAllSites( state ) );
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
	const isWide = useBreakpoint( '>1280px' );

	// Determine if the plugin is WPcom or WPorg hosted
	const productsList = useSelector( ( state ) => getProductsList( state ) );
	const isProductListFetched = Object.values( productsList ).length > 0;

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, props.pluginSlug )
	);

	const isSaasProduct = useSelector( ( state ) =>
		isSaasProductSelector( state, props.pluginSlug )
	);

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
			( ! isMarketplaceProduct && ( isWporgPluginFetching || ! isWporgPluginFetched ) ) ||
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
		fullPlugin,
		requestingPluginsForSites,
	] );

	const setBreadcrumbs = ( breadcrumbs = [] ) => {
		if ( breadcrumbs?.length === 0 ) {
			dispatch(
				appendBreadcrumb( {
					label: translate( 'Plugins' ),
					href: localizePath( `/plugins/${ selectedSite?.slug || '' }` ),
					id: 'plugins',
					helpBubble: translate(
						'Add new functionality and integrations to your site with plugins. {{learnMoreLink}}Learn more{{/learnMoreLink}}.',
						{
							components: {
								learnMoreLink: <InlineSupportLink supportContext="plugins" showIcon={ false } />,
							},
						}
					),
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
		return <PluginDoesNotExistView />;
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

	return (
		<MainComponent wideLayout>
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
			<QuerySitePurchases siteId={ selectedSite?.ID } />
			<FixedNavigationHeader compactBreadcrumb={ ! isWide } navigationItems={ breadcrumbs } />
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ sitesWithPlugins }
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
			<PluginDetailsNotices selectedSite={ selectedSite } plugin={ fullPlugin } />
			<div className="plugin-details__page">
				<div className={ classnames( 'plugin-details__layout', { 'is-logged-in': isLoggedIn } ) }>
					<div className="plugin-details__header">
						<PluginDetailsHeader plugin={ fullPlugin } isPlaceholder={ showPlaceholder } />
					</div>
					<div className="plugin-details__content">
						{ ! showPlaceholder && (
							<div className="plugin-details__body">
								{ ! isJetpackSelfHosted && ! isCompatiblePlugin( props.pluginSlug ) && (
									<Notice
										text={ translate(
											'Incompatible plugin: This plugin is not supported on WordPress.com.'
										) }
										status="is-warning"
										showDismiss={ false }
									>
										<NoticeAction href="/support/incompatible-plugins/">
											{ translate( 'More info' ) }
										</NoticeAction>
									</Notice>
								) }

								{ fullPlugin.wporg || isMarketplaceProduct ? (
									<PluginSections plugin={ fullPlugin } isWpcom={ isWpcom } addBanner />
								) : (
									<PluginSectionsCustom plugin={ fullPlugin } />
								) }
								<RelatedPlugins slug={ props.pluginSlug } />
							</div>
						) }
					</div>

					<div className="plugin-details__actions">
						<PluginDetailsCTA plugin={ fullPlugin } isPlaceholder={ showPlaceholder } />

						{ ! showPlaceholder && ! requestingPluginsForSites && (
							<PluginDetailsSidebar plugin={ fullPlugin } />
						) }
					</div>
				</div>
			</div>
			{ isMarketplaceProduct && ! showPlaceholder && <MarketplaceFooter /> }
		</MainComponent>
	);
}

function PluginDoesNotExistView() {
	const translate = useTranslate();
	const selectedSite = useSelector( getSelectedSite );
	const actionUrl = '/plugins' + ( selectedSite ? '/' + selectedSite.slug : '' );
	const action = translate( 'Browse all plugins' );

	return (
		<MainComponent wideLayout>
			<EmptyContent
				title={ translate( "Oops! We can't find this plugin!" ) }
				line={ translate( "The plugin you are looking for doesn't exist." ) }
				actionURL={ actionUrl }
				action={ action }
				illustration="/calypso/images/illustrations/illustration-404.svg"
			/>
		</MainComponent>
	);
}

export default PluginDetails;
