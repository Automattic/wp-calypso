/**
 * External dependencies
 */
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import debugModule from 'debug';
import page from 'page';
import uniq from 'lodash/uniq';
import upperFirst from 'lodash/upperFirst';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import PluginSiteList from 'my-sites/plugins/plugin-site-list';
import HeaderCake from 'components/header-cake';
import PluginMeta from 'my-sites/plugins/plugin-meta';
import PluginsStore from 'lib/plugins/store';
import PluginsLog from 'lib/plugins/log-store';
import WporgPluginsSelectors from 'state/plugins/wporg/selectors';
import PluginsActions from 'lib/plugins/actions';
import { fetchPluginData as wporgFetchPluginData } from 'state/plugins/wporg/actions';
import PluginNotices from 'lib/plugins/notices';
import MainComponent from 'components/main';
import SidebarNavigation from 'my-sites/sidebar-navigation';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PluginSections from 'my-sites/plugins/plugin-sections';
import pluginsAccessControl from 'my-sites/plugins/access-control';
import EmptyContent from 'components/empty-content';
import FeatureExample from 'components/feature-example';
import WpcomPluginsList from 'my-sites/plugins-wpcom/plugins-list';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:plugin' );

const SinglePlugin = React.createClass( {

	displayName: 'SinglePlugin',

	_DEFAULT_PLUGINS_BASE_PATH: 'http://wordpress.org/plugins/',

	_currentPageTitle: null,

	mixins: [ PluginNotices ],

	componentWillMount() {
		if ( ! this.isFetched() ) {
			this.props.wporgFetchPluginData( this.props.pluginSlug );
		}
	},

	componentDidMount() {
		debug( 'Plugin React component mounted.' );
		this.props.sites.on( 'change', this.refreshSitesAndPlugins );
		PluginsStore.on( 'change', this.refreshSitesAndPlugins );
		PluginsLog.on( 'change', this.refreshSitesAndPlugins );
		this.updatePageTitle();
	},

	getInitialState() {
		return this.getSitesPlugin();
	},

	componentWillUnmount() {
		this.props.sites.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsStore.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsLog.removeListener( 'change', this.refreshSitesAndPlugins );
		if ( this.pluginRefreshTimeout ) {
			clearTimeout( this.pluginRefreshTimeout );
		}
	},

	componentWillReceiveProps( nextProps ) {
		this.refreshSitesAndPlugins( nextProps );
	},

	getSitesPlugin( nextProps ) {
		const props = nextProps || this.props,
			selectedSite = this.props.sites.getSelectedSite();

		// .com sites can't install non .com plugins, if that's the case we don't retrieve any data from the store
		if ( selectedSite && ! selectedSite.jetpack ) {
			return {
				accessError: false,
				sites: [],
				notInstalledSites: [],
				plugin: null
			};
		}

		const sites = uniq( props.sites.getSelectedOrAllWithPlugins() ),
			sitePlugin = PluginsStore.getPlugin( sites, props.pluginSlug );

		let plugin = Object.assign( {
			name: props.pluginSlug,
			id: props.pluginSlug,
			slug: props.pluginSlug
		}, sitePlugin );

		return {
			accessError: pluginsAccessControl.hasRestrictedAccess(),
			sites: PluginsStore.getSites( sites, props.pluginSlug ) || [],
			notInstalledSites: PluginsStore.getNotInstalledSites( sites, props.pluginSlug ) || [],
			plugin: plugin
		};
	},

	refreshSitesAndPlugins( nextProps ) {
		this.setState( this.getSitesPlugin( nextProps ) );
		// setTimeout to avoid React dispatch conflicts.
		this.updatePageTitle();
	},

	updatePageTitle() {
		const pageTitle = this.state.plugin ? this.state.plugin.name : this.props.pluginSlug;
		if ( this._currentPageTitle === pageTitle ) {
			return;
		}

		this._currentPageTitle = pageTitle;
		this.pluginRefreshTimeout = setTimeout( () => {
			this.props.onPluginRefresh( this.translate( '%(pluginName)s Plugin', '%(pluginName)s Plugins', {
				count: pageTitle.toLowerCase() !== 'standard' | 0,
				args: { pluginName: upperFirst( this._currentPageTitle ) },
				textOnly: true,
				context: 'Page title: Plugin detail'
			} ) );
		}, 1 );
	},

	removeNotice( error ) {
		PluginsActions.removePluginsNotices( error );
	},

	recordEvent( eventAction ) {
		analytics.ga.recordEvent( 'Plugins', eventAction, 'Plugin Name', this.props.pluginSlug );
	},

	getPreviousListUrl() {
		const splitPluginUrl = this.props.prevPath.split( '/' + this.props.pluginSlug + '/' );
		let previousPath = this.props.prevPath;

		if ( splitPluginUrl[1] ) { // Strip out the site url part.
			previousPath = splitPluginUrl[0];
		}
		return previousPath + '/' +
			( this.props.siteUrl || '' ) +
			( this.props.prevQuerystring ? '?' + this.props.prevQuerystring : '' );
	},

	goBack() {
		if ( this.props.prevPath ) {
			return page( this.getPreviousListUrl() );
		}
		return page( '/plugins/' + ( this.props.siteUrl || '' ) );
	},

	displayHeader() {
		const recordEvent = this.recordEvent.bind( this, 'Clicked Header Plugin Back Arrow' );
		return (
			<HeaderCake
				isCompact={ true }
				onClick={ this.goBack }
				onBackArrowClick={ recordEvent } />
		);
	},

	pluginExists( plugin ) {
		if ( this.isFetching() ) {
			return 'unknown';
		}
		if ( plugin && plugin.fetched ) {
			return true;
		}

		const sites = this.props.sites.getSelectedOrAllWithPlugins() || [];

		// If the plugin has at least one site then we know it exists
		if ( plugin.sites && plugin.sites[0] ) {
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
		return WporgPluginsSelectors.isFetched( this.props.wporgPlugins, this.props.pluginSlug );
	},

	isFetchingSites() {
		const sites = this.props.sites.getSelectedOrAllWithPlugins() || [];
		return sites.every( PluginsStore.isFetchingSite );
	},

	getPlugin() {
		let plugin = Object.assign( {}, this.state.plugin );
		// assign it .org details
		plugin = Object.assign( plugin, WporgPluginsSelectors.getPlugin( this.props.wporgPlugins, this.props.pluginSlug ) );

		return plugin;
	},

	getPluginDoesNotExistView( selectedSite ) {
		let actionUrl = '/plugins/browse' + ( selectedSite ? '/' + selectedSite.slug : '' ),
			action = this.translate( 'Browse all plugins' );

		return (
			<MainComponent>
				<JetpackManageErrorPage
					title={ this.translate( 'Oops! We can\'t find this plugin!' ) }
					line={ this.translate( 'The plugin you are looking for doesn\'t exist.' ) }
					actionURL={ actionUrl }
					action={ action }
					illustration="/calypso/images/drake/drake-404.svg" />
			</MainComponent>
		);
	},

	renderSitesList( plugin ) {
		if ( this.props.siteUrl || this.isFetching() ) {
			return;
		}

		return (
			<div>
				<PluginSiteList
					className="plugin__installed-on"
					title={ this.translate( 'Installed on', { comment: 'header for list of sites a plugin is installed on' } ) }
					sites={ this.state.sites }
					plugin={ plugin }
					notices={ this.state.notices } />
				{ plugin.wporg && <PluginSiteList
					className="plugin__not-installed-on"
					title={ this.translate( 'Available sites', { comment: 'header for list of sites a plugin can be installed on' } ) }
					sites={ this.state.notInstalledSites }
					plugin={ plugin }
					notices={ this.state.notices } /> }
			</div>
		);
	},

	renderPluginPlaceholder() {
		const selectedSite = this.props.sites.getSelectedSite();
		return (
			<MainComponent>
				<SidebarNavigation />
				<div className="plugin__page" >
					{ this.displayHeader() }
					<PluginMeta
						isPlaceholder
						notices={ this.state.notices }
						isInstalledOnSite={ this.isFetchingSites() ? null : !! PluginsStore.getSitePlugin( selectedSite, this.state.plugin.slug ) }
						plugin={ this.getPlugin() }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ selectedSite } />
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
				software_version: '1'
			}
		};

		return (
			<MainComponent>
				<div className="plugin__page">
					{ this.displayHeader() }
					<PluginMeta
						notices={ {} }
						isInstalledOnSite={ !! PluginsStore.getSitePlugin( selectedSite, this.state.plugin.slug ) }
						plugin={ this.getPlugin() }
						siteUrl={ 'no-real-url' }
						sites={ [ selectedSite ] }
						selectedSite={ selectedSite }
						isMock={ true } />
				</div>
			</MainComponent>
		);
	},

	render() {
		const selectedSite = this.props.sites.getSelectedSite();

		if ( selectedSite && ! selectedSite.jetpack ) {
			return (
				<MainComponent>
					<SidebarNavigation />
					<WpcomPluginsList />
				</MainComponent>
			);
		}

		if ( this.state.accessError ) {
			return (
				<MainComponent>
					<SidebarNavigation />
					<EmptyContent { ...this.state.accessError } />
					{ this.state.accessError.featureExample ? <FeatureExample>{ this.state.accessError.featureExample }</FeatureExample> : null }
				</MainComponent>
			);
		}

		const plugin = this.getPlugin();
		const pluginExists = this.pluginExists( plugin );

		if ( pluginExists === 'unknown' ) {
			return this.renderPluginPlaceholder();
		}

		if ( pluginExists === false ) {
			return this.getPluginDoesNotExistView( selectedSite );
		}

		if ( selectedSite && selectedSite.jetpack && ! selectedSite.canManage() ) {
			return (
				<MainComponent>
					<SidebarNavigation />
					<JetpackManageErrorPage
						template="optInManage"
						title={ this.translate( 'Looking to manage this site\'s plugins?' ) }
						site={ selectedSite }
						section="plugins"
						featureExample={ this.getMockPlugin() } />
				</MainComponent>
			);
		}

		const installInProgress = PluginsLog.isInProgressAction( selectedSite.ID, this.state.plugin.slug, 'INSTALL_PLUGIN' );

		return (
			<MainComponent>
				<SidebarNavigation />
				<div className="plugin__page">
					{ this.displayHeader() }
					<PluginMeta
						notices={ this.state.notices }
						plugin={ plugin }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ selectedSite }
						isInstalledOnSite={ this.isFetchingSites() ? null : !! PluginsStore.getSitePlugin( selectedSite, this.state.plugin.slug ) }
						isInstalling={ installInProgress } />
					{ plugin.wporg && <PluginSections plugin={ plugin } /> }
					{ this.renderSitesList( plugin ) }
				</div>
			</MainComponent>
		);
	}
} );

export default connect(
	( state, props ) => {
		return {
			wporgPlugins: state.plugins.wporg.items,
			wporgFetching: WporgPluginsSelectors.isFetching( state.plugins.wporg.fetchingItems, props.pluginSlug )
		};
	},
	dispatch => bindActionCreators( { wporgFetchPluginData }, dispatch )
)( SinglePlugin );
