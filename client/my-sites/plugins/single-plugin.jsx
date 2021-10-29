import { Card } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import { useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import EmptyContent from 'calypso/components/empty-content';
import HeaderCake from 'calypso/components/header-cake';
import MainComponent from 'calypso/components/main';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginNotices from 'calypso/my-sites/plugins/notices';
import PluginMeta from 'calypso/my-sites/plugins/plugin-meta';
import PluginSections from 'calypso/my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'calypso/my-sites/plugins/plugin-sections/custom';
import PluginSiteList from 'calypso/my-sites/plugins/plugin-site-list';
import { siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import SidebarNavigation from 'calypso/my-sites/sidebar-navigation';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import getToursHistory from 'calypso/state/guided-tours/selectors/get-tours-history';
import {
	getPluginOnSite,
	getPluginOnSites,
	getSiteObjectsWithPlugin,
	getSitesWithoutPlugin,
	isPluginActionInProgress,
	isRequestingForSites,
} from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import {
	isFetching as isWporgPluginFetching,
	isFetched as isWporgPluginFetched,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'calypso/state/selectors/can-current-user-manage-plugins';
import getSelectedOrAllSitesWithPlugins from 'calypso/state/selectors/get-selected-or-all-sites-with-plugins';
import hasNavigated from 'calypso/state/selectors/has-navigated';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite, isRequestingSites } from 'calypso/state/sites/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import NoPermissionsError from './no-permissions-error';

function SinglePlugin( props ) {
	const {
		wporgFetched: isFetched,
		wporgFetching: isFetching,
		plugin,
		wporgPlugin,
		selectedSite,
		siteIds,
		sitesWithPlugin,
		requestingPluginsForSites,
	} = props;

	useEffect( () => {
		if ( ! isFetched ) {
			props.wporgFetchPluginData( props.pluginSlug );
		}
	}, [ isFetched ] );

	const fullPlugin = useMemo( () => {
		// assign it .org details
		return {
			...plugin,
			...wporgPlugin,
		};
	}, [ plugin, wporgPlugin ] );

	const isPluginInstalledOnsite = useMemo( () => {
		if ( requestingPluginsForSites ) {
			return null;
		}

		return !! props.sitePlugin;
	}, [ requestingPluginsForSites, props.sitePlugin ] );

	const existingPlugin = useMemo( () => {
		if ( isFetching || ! isFetched ) {
			return 'unknown';
		}
		if ( fullPlugin && fullPlugin.fetched ) {
			return true;
		}

		// If the plugin has at least one site then we know it exists
		const pluginSites = Object.values( fullPlugin.sites );
		if ( pluginSites && pluginSites[ 0 ] ) {
			return true;
		}

		if ( requestingPluginsForSites ) {
			return 'unknown';
		}

		return false;
	}, [ isFetching, isFetched, fullPlugin, requestingPluginsForSites ] );

	function getPageTitle() {
		return props.translate( '%(pluginName)s Plugin', {
			args: { pluginName: fullPlugin.name },
			textOnly: true,
			context: 'Page title: Plugin detail',
		} );
	}

	function getAllowedPluginActions() {
		const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
		const hiddenForAutomatedTransfer =
			props.isAtomicSite && includes( autoManagedPlugins, fullPlugin.slug );

		return {
			autoupdate: ! hiddenForAutomatedTransfer,
			activation: ! hiddenForAutomatedTransfer,
			remove: ! hiddenForAutomatedTransfer,
		};
	}

	if ( ! props.isRequestingSites && ! props.userCanManagePlugins ) {
		return <NoPermissionsError title={ getPageTitle() } />;
	}

	const allowedPluginActions = getAllowedPluginActions( fullPlugin );

	if ( existingPlugin === 'unknown' ) {
		return (
			<PluginPlaceholder
				fullPlugin={ fullPlugin }
				isPluginInstalledOnsite={ isPluginInstalledOnsite }
				{ ...props }
			/>
		);
	}

	if ( existingPlugin === false ) {
		return <PluginDoesNotExistView translate={ props.translate } selectedSite={ selectedSite } />;
	}

	const isWpcom = selectedSite && ! props.isJetpackSite;
	const analyticsPath = selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';

	return (
		<MainComponent wideLayout>
			<DocumentHead title={ getPageTitle() } />
			<PageViewTracker path={ analyticsPath } title="Plugins > Plugin Details" />
			<QueryJetpackPlugins siteIds={ siteIds } />
			<SidebarNavigation />
			<PluginNotices pluginId={ fullPlugin.id } sites={ props.sites } plugins={ [ fullPlugin ] } />

			<div className="single-plugin__page">
				<div className="single-plugin__layout">
					<div className="single-plugin__layout-col single-plugin__layout-col-left">
						<Header { ...props } />
						<PluginMeta
							plugin={ fullPlugin }
							siteUrl={ props.siteUrl }
							sites={ sitesWithPlugin }
							selectedSite={ selectedSite }
							isInstalledOnSite={ isPluginInstalledOnsite }
							isInstalling={ props.isInstallingPlugin }
							allowedActions={ allowedPluginActions }
						/>
						{ fullPlugin.wporg ? (
							<PluginSections plugin={ fullPlugin } isWpcom={ isWpcom } />
						) : (
							<PluginSectionsCustom plugin={ fullPlugin } />
						) }
						<SitesList fullPlugin={ fullPlugin } isFetching={ isFetching } { ...props } />
					</div>
					<div className="single-plugin__layout-col single-plugin__layout-col-right"></div>
				</div>
			</div>
		</MainComponent>
	);
}

function SitesList( { fullPlugin: plugin, ...props } ) {
	if ( props.siteUrl || props.isFetching ) {
		return null;
	}

	const { translate, sites, sitesWithPlugin, sitesWithoutPlugin } = props;
	const notInstalledSites = sitesWithoutPlugin.map( ( siteId ) =>
		sites.find( ( site ) => site.ID === siteId )
	);

	return (
		<div>
			<PluginSiteList
				className="single-plugin__installed-on"
				title={ translate( 'Installed on', {
					comment: 'header for list of sites a plugin is installed on',
				} ) }
				sites={ sitesWithPlugin }
				plugin={ plugin }
			/>
			{ plugin.wporg && (
				<PluginSiteList
					className="single-plugin__not-installed-on"
					title={ translate( 'Available sites', {
						comment: 'header for list of sites a plugin can be installed on',
					} ) }
					sites={ notInstalledSites }
					plugin={ plugin }
				/>
			) }
		</div>
	);
}

function PluginDoesNotExistView( { selectedSite, translate } ) {
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

function PluginPlaceholder( props ) {
	return (
		<MainComponent wideLayout>
			<SidebarNavigation />
			<div className="single-plugin__page">
				<Header { ...props } />
				<PluginMeta
					isPlaceholder
					isInstalledOnSite={ props.isPluginInstalledOnsite }
					plugin={ props.fullPlugin }
					siteUrl={ props.siteUrl }
					sites={ props.sitesWithPlugin }
					selectedSite={ props.selectedSite }
					isAtomicSite={ props.isAtomicSite }
				/>
			</div>
		</MainComponent>
	);
}

function Header( props ) {
	if ( ! props.selectedSite ) {
		return <Card className="plugins__installed-header" />;
	}

	function getPreviousListUrl() {
		const splitPluginUrl = props.prevPath.split( '/' + props.pluginSlug + '/' );
		let previousPath = props.prevPath;

		if ( splitPluginUrl[ 1 ] ) {
			// Strip out the site url part.
			previousPath = splitPluginUrl[ 0 ];
		}
		return (
			previousPath +
			'/' +
			( props.siteUrl || '' ) +
			( props.prevQuerystring ? '?' + props.prevQuerystring : '' )
		);
	}

	const backHref = ( shouldUseHistoryBack ) => {
		const { prevPath, siteUrl } = props;
		if ( prevPath ) {
			return getPreviousListUrl();
		}
		return ! shouldUseHistoryBack ? '/plugins/manage/' + ( siteUrl || '' ) : null;
	};

	const recordEvent = ( eventAction ) => {
		props.recordGoogleEvent( 'Plugins', eventAction, 'Plugin Name', props.pluginSlug );
	};

	const recordBackArrowClickedEvent = recordEvent( 'Clicked Header Plugin Back Arrow' );
	const shouldUseHistoryBack = window.history.length > 1 && props.navigated;
	return (
		<HeaderCake
			isCompact={ true }
			backHref={ backHref( shouldUseHistoryBack ) }
			onBackArrowClick={ recordBackArrowClickedEvent }
			onClick={ shouldUseHistoryBack ? goBack : undefined }
		/>
	);
}

function goBack() {
	window.history.back();
}

export default connect(
	( state, props ) => {
		const selectedSiteId = getSelectedSiteId( state );
		const sites = getSelectedOrAllSitesWithPlugins( state );
		const siteIds = [ ...new Set( siteObjectsToSiteIds( sites ) ) ];

		return {
			plugin: getPluginOnSites( state, siteIds, props.pluginSlug ),
			sitesWithPlugin: getSiteObjectsWithPlugin( state, siteIds, props.pluginSlug ),
			sitePlugin: selectedSiteId && getPluginOnSite( state, selectedSiteId, props.pluginSlug ),
			wporgPlugin: getWporgPlugin( state, props.pluginSlug ),
			wporgFetching: isWporgPluginFetching( state, props.pluginSlug ),
			wporgFetched: isWporgPluginFetched( state, props.pluginSlug ),
			selectedSite: getSelectedSite( state ),
			sitesWithoutPlugin: getSitesWithoutPlugin( state, siteIds, props.pluginSlug ),
			isAtomicSite: isSiteAutomatedTransfer( state, selectedSiteId ),
			isJetpackSite: selectedSiteId && isJetpackSite( state, selectedSiteId ),
			isInstallingPlugin: isPluginActionInProgress(
				state,
				selectedSiteId,
				props.pluginSlug,
				INSTALL_PLUGIN
			),
			isRequestingSites: isRequestingSites( state ),
			requestingPluginsForSites: isRequestingForSites( state, siteIds ),
			userCanManagePlugins: selectedSiteId
				? canCurrentUser( state, selectedSiteId, 'manage_options' )
				: canCurrentUserManagePlugins( state ),
			siteIds,
			sites,
			toursHistory: getToursHistory( state ),
			navigated: hasNavigated( state ),
		};
	},
	{
		recordGoogleEvent,
		wporgFetchPluginData,
	}
)( localize( SinglePlugin ) );
