import { useTranslate } from 'i18n-calypso';
import { isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import FixedNavigationHeader from 'calypso/components/fixed-navigation-header';
import MainComponent from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginDetailsCTA from 'calypso/my-sites/plugins/plugin-details-CTA';
import PluginDetailsHeader from 'calypso/my-sites/plugins/plugin-details-header';
import PluginDetailsSidebar from 'calypso/my-sites/plugins/plugin-details-sidebar';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import {
	getPluginOnSite,
	getPluginOnSites,
	getSiteObjectsWithPlugin,
	getSitesWithoutPlugin,
	isRequestingForSites,
} from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetchingSelector,
	isFetched as isWporgPluginFetchedSelector,
	getPlugin as getWporgPluginSelector,
} from 'calypso/state/plugins/wporg/selectors';
import {
	isMarketplaceProduct as isMarketplaceProductSelector,
	getProductsList,
} from 'calypso/state/products-list/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import {
	isJetpackSite,
	isRequestingSites as checkRequestingSites,
} from 'calypso/state/sites/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';

function PluginDetails( props ) {
	const dispatch = useDispatch();
	const translate = useTranslate();

	// Site information.
	const selectedSite = useSelector( getSelectedSite );
	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const sites = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];
	const isRequestingSites = useSelector( checkRequestingSites );
	const requestingPluginsForSites = useSelector( ( state ) =>
		isRequestingForSites( state, siteIds )
	);
	const analyticsPath = selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';

	// Plugin information.
	const plugin = useSelector( ( state ) => getPluginOnSites( state, siteIds, props.pluginSlug ) );
	const wporgPlugin = useSelector( ( state ) => getWporgPluginSelector( state, props.pluginSlug ) );
	const isWporgPluginFetching = useSelector( ( state ) =>
		isWporgPluginFetchingSelector( state, props.pluginSlug )
	);
	const isWporgPluginFetched = useSelector( ( state ) =>
		isWporgPluginFetchedSelector( state, props.pluginSlug )
	);
	const sitePlugin = useSelector( ( state ) =>
		getPluginOnSite( state, selectedSite?.ID, props.pluginSlug )
	);
	const userCanManagePlugins = useSelector( ( state ) =>
		selectedSite?.ID
			? canCurrentUser( state, selectedSite?.ID, 'manage_options' )
			: canCurrentUserManagePlugins( state )
	);

	const isPluginInstalledOnsite =
		sitesWithPlugins.length && ! requestingPluginsForSites ? !! sitePlugin : false;

	// Site type.
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, selectedSite?.ID ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, selectedSite?.ID ) );
	const isWpcom = selectedSite && ! isJetpack;
	const isJetpackSelfHosted = selectedSite && isJetpack && ! isAtomic;

	// Determine if the plugin is WPcom or WPorg hosted
	const productsList = useSelector( ( state ) => getProductsList( state ) );
	const isProductListFetched = ! isEmpty( productsList );

	const isMarketplaceProduct = useSelector( ( state ) =>
		isMarketplaceProductSelector( state, props.pluginSlug )
	);

	// Fetch WPorg plugin data if needed
	useEffect( () => {
		if ( isProductListFetched && ! isMarketplaceProduct && ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( props.pluginSlug ) );
		}
	}, [
		isProductListFetched,
		isMarketplaceProduct,
		isWporgPluginFetched,
		props.pluginSlug,
		dispatch,
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
			rating: ( wpComPluginData?.rating / 5 ) * 100,
		};

		return {
			...plugin,
			...wpcomPlugin,
			...wporgPlugin,
		};
	}, [ plugin, wporgPlugin, wpComPluginData, isWpComPluginFetched ] );

	const existingPlugin = useMemo( () => {
		// ( ! isMarketplaceProduct && ( isWporgPluginFetching || ! isWporgPluginFetched ) ) ||
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

	const getNavigationItems = () => {
		// ToDo:
		// - add "Search Results" breadcrumb if prev page was search results
		// - change the first breadcrumb if prev page wasn't plugins page (eg activity log)
		const navigationItems = [
			{ label: translate( 'Plugins' ), href: `/plugins/${ selectedSite?.slug || '' }` },
			{ label: fullPlugin.name },
		];

		return navigationItems;
	};

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

	return (
		<MainComponent wideLayout>
			<DocumentHead title={ getPageTitle() } />
			<PageViewTracker path={ analyticsPath } title="Plugins > Plugin Details" />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<SidebarNavigation />
			<QueryEligibility siteId={ selectedSite?.ID } />
			<FixedNavigationHeader navigationItems={ getNavigationItems() } />
			<PluginNotices
				pluginId={ fullPlugin.id }
				sites={ sitesWithPlugins }
				plugins={ [ fullPlugin ] }
			/>

			<div className="plugin-details__page">
				<div className="plugin-details__layout plugin-details__top-section">
					<div className="plugin-details__layout-col-left">
						<PluginDetailsHeader plugin={ fullPlugin } isPlaceholder={ showPlaceholder } />
					</div>

					<div className="plugin-details__layout-col-right">
						<PluginDetailsCTA
							pluginSlug={ props.pluginSlug }
							siteIds={ siteIds }
							selectedSite={ selectedSite }
							isPluginInstalledOnsite={ isPluginInstalledOnsite }
							isPlaceholder={ showPlaceholder }
						/>
					</div>
				</div>

				{ ! showPlaceholder && (
					<>
						{ ! isJetpackSelfHosted && ! isCompatiblePlugin( props.pluginSlug ) && (
							<Notice
								text={ translate(
									'Incompatible plugin: This plugin is not supported on WordPress.com.'
								) }
								status="is-warning"
								showDismiss={ false }
							>
								<NoticeAction href="https://wordpress.com/support/incompatible-plugins/">
									{ translate( 'More info' ) }
								</NoticeAction>
							</Notice>
						) }

						<SitesListArea
							fullPlugin={ fullPlugin }
							isPluginInstalledOnsite={ isPluginInstalledOnsite }
							{ ...props }
						/>

						<div className="plugin-details__layout plugin-details__body">
							<div className="plugin-details__layout-col-left">
								{ fullPlugin.wporg ? (
									<PluginSections
										className="plugin-details__plugins-sections"
										plugin={ fullPlugin }
										isWpcom={ isWpcom }
										addBanner
										removeReadMore
									/>
								) : (
									<PluginSectionsCustom plugin={ fullPlugin } />
								) }
							</div>
							<div className="plugin-details__layout-col-right">
								<PluginDetailsSidebar plugin={ fullPlugin } />
							</div>
						</div>
					</>
				) }
			</div>
		</MainComponent>
	);
}

function SitesListArea( { fullPlugin: plugin, isPluginInstalledOnsite, ...props } ) {
	const translate = useTranslate();

	const selectedSite = useSelector( getSelectedSite );

	const sitesWithPlugins = useSelector( getSelectedOrAllSitesWithPlugins );
	const siteIds = [ ...new Set( siteObjectsToSiteIds( sitesWithPlugins ) ) ];

	const isFetching = useSelector( ( state ) =>
		isWporgPluginFetchingSelector( state, props.pluginSlug )
	);
	const sitesWithPlugin = useSelector( ( state ) =>
		getSiteObjectsWithPlugin( state, siteIds, props.pluginSlug )
	);
	const sitesWithoutPlugin = useSelector( ( state ) =>
		getSitesWithoutPlugin( state, siteIds, props.pluginSlug )
	);

	if ( isFetching || ( props.siteUrl && ! isPluginInstalledOnsite ) ) {
		return null;
	}

	const notInstalledSites = sitesWithoutPlugin.map( ( siteId ) =>
		sitesWithPlugins.find( ( site ) => site.ID === siteId )
	);

	return (
		<div className="plugin-details__sites-list-background">
			<div className="plugin-details__sites-list">
				<PluginSiteList
					className="plugin-details__installed-on"
					title={ getInstalledOnTitle( {
						translate,
						selectedSite,
						count: sitesWithPlugin.length,
					} ) }
					sites={ sitesWithPlugin }
					plugin={ plugin }
					titlePrimary
					showAdditionalHeaders
				/>
				{ plugin.wporg && (
					<PluginSiteList
						className="plugin-details__not-installed-on"
						title={ getAvailabeOnTitle( {
							translate,
							selectedSite,
							count: notInstalledSites.length,
						} ) }
						sites={ notInstalledSites }
						plugin={ plugin }
					/>
				) }
			</div>
		</div>
	);
}

function getInstalledOnTitle( { translate, selectedSite, count } ) {
	const installedOnSingleSiteTitle = translate( 'Installed on', {
		comment: 'header for list of sites a plugin is installed on',
	} );

	const installedOnMultiSiteTitle = translate( 'Installed on %d site', 'Installed on %d sites', {
		comment: 'header for list of sites a plugin is installed on',
		args: [ count ],
		count,
	} );

	return selectedSite ? installedOnSingleSiteTitle : installedOnMultiSiteTitle;
}

function getAvailabeOnTitle( { translate, selectedSite, count } ) {
	const availableOnSingleSiteTitle = translate( 'Available sites', {
		comment: 'header for list of sites a plugin can be installed on',
	} );

	const availabeOnMultiSiteTitle = translate( 'Available on %d site', 'Available on %d sites', {
		comment: 'header for list of sites a plugin can be installed on',
		args: [ count ],
		count,
	} );

	return selectedSite ? availableOnSingleSiteTitle : availabeOnMultiSiteTitle;
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
