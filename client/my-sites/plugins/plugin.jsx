/**
 * External dependencies
 */
import React from 'react/addons'
import debugModule from 'debug';
import page from 'page';
import classNames from 'classnames';
import property from 'lodash/utility/property';
import filter from 'lodash/collection/filter';
import reject from 'lodash/collection/reject';
import uniq from 'lodash/array/uniq';
import config from 'config';

/**
 * Internal dependencies
 */
import analytics from 'analytics';
import PluginSiteList from 'my-sites/plugins/plugin-site-list';
import HeaderCake from 'components/header-cake';
import PluginMeta from 'my-sites/plugins/plugin-meta';
import PluginInformation from 'my-sites/plugins/plugin-information';
import PluginsStore from 'lib/plugins/store';
import PluginsLog from 'lib/plugins/log-store';
import PluginsDataStore from 'lib/plugins/wporg-data/store';
import PluginsActions from 'lib/plugins/actions';
import PluginNotices from 'lib/plugins/notices';
import MainComponent from 'components/main';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PluginSections from 'my-sites/plugins/plugin-sections';
import pluginsAccessControl from 'my-sites/plugins/access-control';
import EmptyContent from 'components/empty-content';
import FeatureExample from 'components/feature-example'

/**
 * Module variables
 */
const debug = debugModule( 'calypso:my-sites:plugin' );

export default React.createClass( {

	displayName: 'Plugin',

	_DEFAULT_PLUGINS_BASE_PATH: 'http://wordpress.org/plugins/',

	mixins: [ PluginNotices ],

	componentDidMount() {
		debug( 'Plugin React component mounted.' );
		this.props.sites.on( 'change', this.refreshSitesAndPlugins );
		PluginsStore.on( 'change', this.refreshSitesAndPlugins );
		PluginsDataStore.on( 'change', this.refreshSitesAndPlugins );
		PluginsLog.on( 'change', this.refreshSitesAndPlugins );
	},

	getInitialState() {
		return this.getSitesPlugin();
	},

	componentWillUnmount() {
		this.props.sites.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsStore.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsDataStore.removeListener( 'change', this.refreshSitesAndPlugins );
		PluginsLog.removeListener( 'change', this.refreshSitesAndPlugins );
	},

	componentWillReceiveProps( nextProps ) {
		if ( this.props.path !== nextProps.path ) {
			this.refreshSitesAndPlugins( nextProps );
		}
	},

	getSitesPlugin( nextProps ) {
		const props = nextProps || this.props,
			selectedSite = this.props.sites.getSelectedSite();

		// .com sites can't install non .com plugins, if that's the case we don't retrieve any data from the store
		if ( ! props.isWpcomPlugin && selectedSite && ! selectedSite.jetpack ) {
			return {
				isFetching: false,
				accessError: false,
				sites: [],
				notInstalledSites: [],
				plugin: null
			};
		}

		const allSites = uniq( props.sites.getSelectedOrAllWithPlugins() ),
			sites = props.isWpcomPlugin ?
				reject( allSites, property( 'jetpack' ) ) :
				filter( allSites, property( 'jetpack' ) ),
			sitePlugin = PluginsStore.getPlugin( sites, props.pluginSlug );

		let plugin = Object.assign( {
				name: props.pluginSlug,
				id: props.pluginSlug,
				slug: props.pluginSlug
			}, sitePlugin ),
			isFetching = ! sitePlugin;

		if ( sitePlugin && ! props.isWpcomPlugin ) {
			// if it isn't a .com plugin, assign it .org details
			plugin = Object.assign( plugin, PluginsDataStore.get( props.pluginSlug ) );
			isFetching = PluginsDataStore.isFetching( props.pluginSlug );
		}

		return {
			isFetching: isFetching,
			accessError: pluginsAccessControl.hasRestrictedAccess(),
			sites: PluginsStore.getSites( sites, props.pluginSlug ) || [],
			notInstalledSites: PluginsStore.getNotInstalledSites( sites, props.pluginSlug ) || [],
			plugin: plugin
		};
	},

	refreshSitesAndPlugins( nextProps ) {
		this.setState( this.getSitesPlugin( nextProps ) );

		// setTimeout to avoid React dispatch conflicts.
		setTimeout( () => {
			this.props.onPluginRefresh( this.translate( '%(pluginName)s Plugin', {
				args: { pluginName: this.state.plugin ? this.state.plugin.name : this.props.pluginSlug },
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
		return this.props.prevPath + '/' +
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
		return (
			<HeaderCake
				isCompact={ true }
				onClick={ this.goBack }
				onBackArrowClick={ this.recordEvent.bind( this, 'Clicked Header Plugin Back Arrow' ) } />
		);
	},

	pluginExists( pluginSlug ) {
		// if the plugin info is still being fetched, we default to true
		if ( ! PluginsDataStore.isFetching( pluginSlug ) ) {
			if ( PluginsDataStore.get( pluginSlug ) ) {
				return true;
			}
			const sites = this.props.sites.getSelectedOrAllWithPlugins() || [];
			// if there's no info about the plugin from .org, we check if the pluginSlug exists in
			// any of the user's sites, to check if it's a custom plugin
			return sites.some( site => {
				const sitePlugins = PluginsStore.getSitePlugins( site ) || [];

				if ( PluginsStore.isFetchingSite( site ) ) {
					return true;
				}

				return sitePlugins.some( plugin => plugin.slug === pluginSlug );
			} );
		}
		return true;
	},

	getPluginDoesNotExistView( selectedSite ) {
		let actionUrl,
			action;
		if ( config.isEnabled( 'manage/plugins/browser' ) ) {
			actionUrl = '/plugins/browse' + ( selectedSite ? '/' + selectedSite.slug : '' );
			action = this.translate( 'Browse all plugins' );
		}
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

	renderSitesList() {
		if ( this.props.siteUrl ) {
			return;
		}

		if ( this.state.plugin.wporg ) {
			return (
				<div>
					<PluginSiteList
						className="plugin__installed-on"
						title={ this.translate( 'Installed on', { comment: 'header for list of sites a plugin is installed on' } ) }
						sites={ this.state.sites }
						plugin={ this.state.plugin }
						notices={ this.state.notices } />
					<PluginSiteList
						className="plugin__not-installed-on"
						title={ this.translate( 'Available sites', { comment: 'header for list of sites a plugin can be installed on' } ) }
						sites={ this.state.notInstalledSites }
						plugin={ this.state.plugin }
						notices={ this.state.notices } />
				</div>
			);
		}
		return <PluginSiteList
					className="plugin__installed-on"
					title={ this.translate( 'Available on', { comment: 'header for list of sites a plugin is available on' } ) }
					sites={ this.state.sites }
					plugin={ this.state.plugin }
					notices={ this.state.notices } />
	},

	renderPluginPlaceholder( classes ) {
		return (
			<MainComponent>
				<div className={ classes }>
					{ this.displayHeader() }
					<PluginMeta
						isPlaceholder
						notices={ this.state.notices }
						plugin={ this.state.plugin }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ this.props.sites.getSelectedSite() } />
					<PluginInformation isPlaceholder />
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
				'software_version': 1
			}
		}
		return (
			<MainComponent>
				<div className="plugin__page">
					{ this.displayHeader() }
					<PluginMeta
						notices={ [] }
						plugin={ this.state.plugin }
						siteUrl={ 'no-real-url' }
						sites={ [ selectedSite ] }
						selectedSite={ selectedSite }
						isMock={ true } />
				</div>
			</MainComponent>
		);
	},

	render() {
		const selectedSite = this.props.sites.getSelectedSite(),
			classes = classNames( 'plugin__page', { 'is-wpcom': this.props.isWpcomPlugin } );

		if ( ! this.props.isWpcomPlugin && selectedSite && ! selectedSite.jetpack ) {
			return (
				<MainComponent>
					<EmptyContent
						title={ this.translate( 'Oops! Not supported' ) }
						line={ this.translate( 'This site doesn\'t support installing plugins. Switch to a self-hosted site to install and manage plugins' ) }
						illustration={ '/calypso/images/drake/drake-whoops.svg' }
						fullWidth={ true } />
				</MainComponent>
			);
		}

		if ( this.state.accessError ) {
			return (
				<MainComponent>
					<EmptyContent { ...this.state.accessError } />
					{ this.state.accessError.featureExample ? <FeatureExample>{ this.state.accessError.featureExample }</FeatureExample> : null }
				</MainComponent>
			);
		}

		if ( this.state.isFetching ) {
			return this.renderPluginPlaceholder( classes );
		}

		if ( ! this.pluginExists( this.props.pluginSlug ) ) {
			return this.getPluginDoesNotExistView( selectedSite );
		}

		if ( selectedSite &&
				selectedSite.modulesFetched &&
				! selectedSite.canManage() ) {
			return (
				<MainComponent>
					<JetpackManageErrorPage
						template="optInManage"
						site={ this.props.site }
						actionURL={ selectedSite.getRemoteManagementURL() + '&section=plugings' }
						illustration= '/calypso/images/jetpack/jetpack-manage.svg'
						featureExample={ this.getMockPlugin() } />
				</MainComponent>
			);
		}

		const installInProgress = PluginsLog.isInProgressAction( selectedSite.ID, this.state.plugin.slug, 'INSTALL_PLUGIN' );

		return (
			<MainComponent>
				<div className={ classes }>
					{ this.displayHeader() }
					<PluginMeta
						notices={ this.state.notices }
						plugin={ this.state.plugin }
						siteUrl={ this.props.siteUrl }
						sites={ this.state.sites }
						selectedSite={ selectedSite }
						isInstalling={ installInProgress } />
					<PluginInformation plugin={ this.state.plugin } />
					<PluginSections plugin={ this.state.plugin } />
					{ this.renderSitesList() }
				</div>
			</MainComponent>
		);
	}
} );
