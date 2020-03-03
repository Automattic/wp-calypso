/**
 * External dependencies
 */

import React from 'react';
import createReactClass from 'create-react-class';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { includes, uniq } from 'lodash';
import { isEnabled } from 'config';

/**
 * Internal dependencies
 */
import PluginSiteList from 'my-sites/plugins/plugin-site-list';
import HeaderCake from 'components/header-cake';
import { Card } from '@automattic/components';
import PluginMeta from 'my-sites/plugins/plugin-meta';
import PluginsStore from 'lib/plugins/store';
import PluginsLog from 'lib/plugins/log-store';
import { getPlugin, isFetched, isFetching } from 'state/plugins/wporg/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'state/plugins/wporg/actions';
import PluginNotices from 'lib/plugins/notices';
import MainComponent from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PluginSections from 'my-sites/plugins/plugin-sections';
import PluginSectionsCustom from 'my-sites/plugins/plugin-sections/custom';
import DocumentHead from 'components/data/document-head';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import { canJetpackSiteManage, isJetpackSite, isRequestingSites } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import canCurrentUserManagePlugins from 'state/selectors/can-current-user-manage-plugins';
import getSelectedOrAllSitesWithPlugins from 'state/selectors/get-selected-or-all-sites-with-plugins';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import NoPermissionsError from './no-permissions-error';
import getToursHistory from 'state/ui/guided-tours/selectors/get-tours-history';
import hasNavigated from 'state/selectors/has-navigated';

/* eslint-disable react/prefer-es6-class */

function goBack() {
	window.history.back();
}

const SinglePlugin = createReactClass( {
	displayName: 'SinglePlugin',
	_DEFAULT_PLUGINS_BASE_PATH: 'http://wordpress.org/plugins/',
	mixins: [ PluginNotices ],

	UNSAFE_componentWillMount() {
		if ( ! this.isFetched() ) {
			this.props.wporgFetchPluginData( this.props.pluginSlug );
		}
	},

	componentDidMount() {
		PluginsStore.on( 'change', this.refreshSitesAndPlugins );
		PluginsLog.on( 'change', this.refreshSitesAndPlugins );
		this.hasAlreadyShownTheTour = false;
	},

	getInitialState() {
		return this.getSitesPlugin();
	},

	componentWillUnmount() {
		PluginsStore.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsLog.removeListener( 'change', this.refreshSitesAndPlugins );
		this.hasAlreadyShownTheTour = false;
		if ( this.pluginRefreshTimeout ) {
			clearTimeout( this.pluginRefreshTimeout );
		}
	},

	UNSAFE_componentWillReceiveProps( nextProps ) {
		this.refreshSitesAndPlugins( nextProps );
	},

	getSitesPlugin( nextProps ) {
		const props = nextProps || this.props;

		const sites = uniq( props.sites ),
			sitePlugin = PluginsStore.getPlugin( sites, props.pluginSlug ),
			plugin = Object.assign(
				{
					name: props.pluginSlug,
					id: props.pluginSlug,
					slug: props.pluginSlug,
				},
				sitePlugin
			);

		return {
			sites: PluginsStore.getSites( sites, props.pluginSlug ) || [],
			notInstalledSites: PluginsStore.getNotInstalledSites( sites, props.pluginSlug ) || [],
			plugin,
		};
	},

	refreshSitesAndPlugins( nextProps ) {
		this.setState( this.getSitesPlugin( nextProps ) );
	},

	getPageTitle() {
		const plugin = this.getPlugin();
		return this.props.translate( '%(pluginName)s Plugin', {
			args: { pluginName: plugin.name },
			textOnly: true,
			context: 'Page title: Plugin detail',
		} );
	},

	recordEvent( eventAction ) {
		this.props.recordGoogleEvent( 'Plugins', eventAction, 'Plugin Name', this.props.pluginSlug );
	},

	getPreviousListUrl() {
		const splitPluginUrl = this.props.prevPath.split( '/' + this.props.pluginSlug + '/' );
		let previousPath = this.props.prevPath;

		if ( splitPluginUrl[ 1 ] ) {
			// Strip out the site url part.
			previousPath = splitPluginUrl[ 0 ];
		}
		return (
			previousPath +
			'/' +
			( this.props.siteUrl || '' ) +
			( this.props.prevQuerystring ? '?' + this.props.prevQuerystring : '' )
		);
	},

	backHref( shouldUseHistoryBack ) {
		const { prevPath, siteUrl } = this.props;
		if ( prevPath ) {
			return this.getPreviousListUrl();
		}
		return ! shouldUseHistoryBack ? '/plugins/manage/' + ( siteUrl || '' ) : null;
	},

	displayHeader( calypsoify ) {
		if ( ! this.props.selectedSite || calypsoify ) {
			return <Card className="plugins__installed-header" />;
		}

		const recordEvent = this.recordEvent.bind( this, 'Clicked Header Plugin Back Arrow' );
		const { navigated } = this.props;
		const shouldUseHistoryBack = window.history.length > 1 && navigated;
		return (
			<HeaderCake
				isCompact={ true }
				backHref={ this.backHref( shouldUseHistoryBack ) }
				onBackArrowClick={ recordEvent }
				onClick={ shouldUseHistoryBack ? goBack : undefined }
			/>
		);
	},

	pluginExists( plugin ) {
		if ( this.isFetching() ) {
			return 'unknown';
		}
		if ( plugin && plugin.fetched ) {
			return true;
		}

		const sites = this.props.sites;

		// If the plugin has at least one site then we know it exists
		if ( plugin.sites && plugin.sites[ 0 ] ) {
			return true;
		}

		if ( sites.some( PluginsStore.isFetchingSite ) ) {
			return 'unknown';
		}

		return false;
	},

	isFetching() {
		return this.props.wporgFetching;
	},

	isFetched() {
		return isFetched( this.props.wporgPlugins, this.props.pluginSlug );
	},

	isFetchingSites() {
		return this.props.sites.every( PluginsStore.isFetchingSite );
	},

	getPlugin() {
		let plugin = Object.assign( {}, this.state.plugin );
		// assign it .org details
		plugin = Object.assign( plugin, getPlugin( this.props.wporgPlugins, this.props.pluginSlug ) );

		return plugin;
	},

	getPluginDoesNotExistView( selectedSite ) {
		const { translate } = this.props;
		const actionUrl = '/plugins' + ( selectedSite ? '/' + selectedSite.slug : '' );
		const action = translate( 'Browse all plugins' );

		return (
			<MainComponent>
				<JetpackManageErrorPage
					title={ translate( "Oops! We can't find this plugin!" ) }
					line={ translate( "The plugin you are looking for doesn't exist." ) }
					actionURL={ actionUrl }
					action={ action }
					illustration="/calypso/images/illustrations/illustration-404.svg"
				/>
			</MainComponent>
		);
	},

	getAllowedPluginActions( plugin ) {
		const autoManagedPlugins = [ 'jetpack', 'vaultpress', 'akismet' ];
		const hiddenForAutomatedTransfer =
			this.props.isAtomicSite && includes( autoManagedPlugins, plugin.slug );

		return {
			autoupdate: ! hiddenForAutomatedTransfer,
			activation: ! hiddenForAutomatedTransfer,
			remove: ! hiddenForAutomatedTransfer,
		};
	},

	isPluginInstalledOnsite() {
		if ( this.isFetchingSites() ) {
			return null;
		}

		return !! PluginsStore.getSitePlugin( this.props.selectedSite, this.state.plugin.slug );
	},

	renderDocumentHead() {
		return <DocumentHead title={ this.getPageTitle() } />;
	},

	renderPageViewTracker() {
		const analyticsPath = this.props.selectedSite ? '/plugins/:plugin/:site' : '/plugins/:plugin';

		return <PageViewTracker path={ analyticsPath } title="Plugins > Plugin Details" />;
	},

	renderSitesList( plugin ) {
		if ( this.props.siteUrl || this.isFetching() ) {
			return;
		}

		const { translate } = this.props;

		return (
			<div>
				<PluginSiteList
					className="plugin__installed-on"
					title={ translate( 'Installed on', {
						comment: 'header for list of sites a plugin is installed on',
					} ) }
					sites={ this.state.sites }
					plugin={ plugin }
					notices={ this.state.notices }
				/>
				{ plugin.wporg && (
					<PluginSiteList
						className="plugin__not-installed-on"
						title={ translate( 'Available sites', {
							comment: 'header for list of sites a plugin can be installed on',
						} ) }
						sites={ this.state.notInstalledSites }
						plugin={ plugin }
						notices={ this.state.notices }
					/>
				) }
			</div>
		);
	},

	renderPluginPlaceholder() {
		const { selectedSite } = this.props;
		return (
			<MainComponent>
				<SidebarNavigation />
				<div className="plugin__page">
					{ this.displayHeader() }
					<PluginMeta
						isPlaceholder
						isInstalledOnSite={ this.isPluginInstalledOnsite() }
						plugin={ this.getPlugin() }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ selectedSite }
						isAtomicSite={ this.props.isAtomicSite }
					/>
				</div>
			</MainComponent>
		);
	},

	getMockPlugin() {
		const selectedSite = {
			slug: 'no-slug',
			canUpdateFiles: true,
			name: 'Not a real site',
			options: {
				software_version: '1',
			},
			plan: {
				expired: false,
				free_trial: false,
				product_id: 2002,
				product_name_short: 'Free',
				product_slug: 'jetpack_free',
				user_is_owner: false,
			},
		};

		return (
			<MainComponent>
				<div className="plugin__page">
					{ this.displayHeader() }
					<PluginMeta
						isInstalledOnSite={ this.isPluginInstalledOnsite() }
						plugin={ this.getPlugin() }
						siteUrl={ 'no-real-url' }
						sites={ [ selectedSite ] }
						selectedSite={ selectedSite }
						isMock={ true }
						isAtomicSite={ this.props.isAtomicSite }
					/>
				</div>
			</MainComponent>
		);
	},

	render() {
		const { selectedSite } = this.props;
		if ( ! this.props.isRequestingSites && ! this.props.userCanManagePlugins ) {
			return <NoPermissionsError title={ this.getPageTitle() } />;
		}

		const plugin = this.getPlugin();
		const pluginExists = this.pluginExists( plugin );
		const allowedPluginActions = this.getAllowedPluginActions( plugin );

		if ( pluginExists === 'unknown' ) {
			return this.renderPluginPlaceholder();
		}

		if ( pluginExists === false ) {
			return this.getPluginDoesNotExistView( selectedSite );
		}

		if ( selectedSite && this.props.isJetpackSite && ! this.props.canJetpackSiteManage ) {
			return (
				<MainComponent>
					{ this.renderDocumentHead() }
					{ this.renderPageViewTracker() }
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="optInManage"
						title={ this.props.translate( "Looking to manage this site's plugins?" ) }
						siteId={ selectedSite.ID }
						section="plugins"
						featureExample={ this.getMockPlugin() }
					/>
				</MainComponent>
			);
		}

		const installing =
			selectedSite &&
			PluginsLog.isInProgressAction( selectedSite.ID, this.state.plugin.slug, 'INSTALL_PLUGIN' );

		const isWpcom = selectedSite && ! this.props.isJetpackSite;
		const calypsoify = this.props.isAtomicSite && isEnabled( 'calypsoify/plugins' );

		return (
			<MainComponent>
				{ this.renderDocumentHead() }
				{ this.renderPageViewTracker() }
				<SidebarNavigation />
				<div className="plugin__page">
					{ this.displayHeader( calypsoify ) }
					<PluginMeta
						plugin={ plugin }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ selectedSite }
						isInstalledOnSite={ this.isPluginInstalledOnsite() }
						isInstalling={ installing }
						allowedActions={ allowedPluginActions }
						calypsoify={ calypsoify }
					/>
					{ plugin.wporg ? (
						<PluginSections plugin={ plugin } isWpcom={ isWpcom } />
					) : (
						<PluginSectionsCustom plugin={ plugin } />
					) }
					{ this.renderSitesList( plugin ) }
				</div>
			</MainComponent>
		);
	},
} );

export default connect(
	( state, props ) => {
		const selectedSiteId = getSelectedSiteId( state );

		return {
			wporgPlugins: state.plugins.wporg.items,
			wporgFetching: isFetching( state.plugins.wporg.fetchingItems, props.pluginSlug ),
			selectedSite: getSelectedSite( state ),
			isAtomicSite: isSiteAutomatedTransfer( state, selectedSiteId ),
			isJetpackSite: selectedSiteId && isJetpackSite( state, selectedSiteId ),
			canJetpackSiteManage: selectedSiteId && canJetpackSiteManage( state, selectedSiteId ),
			isRequestingSites: isRequestingSites( state ),
			userCanManagePlugins: selectedSiteId
				? canCurrentUser( state, selectedSiteId, 'manage_options' )
				: canCurrentUserManagePlugins( state ),
			sites: getSelectedOrAllSitesWithPlugins( state ),
			toursHistory: getToursHistory( state ),
			navigated: hasNavigated( state ),
		};
	},
	{
		recordGoogleEvent,
		wporgFetchPluginData,
	}
)( localize( SinglePlugin ) );
