/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import filter from 'lodash/filter';
import range from 'lodash/range';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import FeatureExample from 'components/feature-example';
import Button from 'components/button';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';
import JetpackSite from 'lib/site/jetpack';
import sitesFactory from 'lib/sites-list';
const sites = sitesFactory();
import support from 'lib/url/support';
import utils from 'lib/site/utils';

// Redux actions & selectors
import { getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { requestSites } from 'state/sites/actions';
import {
	fetchInstallInstructions,
	installPlugin,
} from 'state/plugins/premium/actions';
import {
	getPluginsForSite,
	getActivePlugin,
	getNextPlugin,
	isFinished,
	isInstalling,
	isRequesting,
	hasRequested
} from 'state/plugins/premium/selectors';
// Store for existing plugins
import PluginsStore from 'lib/plugins/store';

const helpLinks = {
	vaultpress: support.JETPACK_SERVICE_VAULTPRESS,
	akismet: support.JETPACK_SERVICE_AKISMET,
	polldaddy: support.JETPACK_SERVICE_POLLDADDY,
};

const PlansSetup = React.createClass( {
	displayName: 'PlanSetup',

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins( plugins ) {
		return plugins.map( plugin => {
			const pluginData = getPlugin( this.props.wporg, plugin.slug );
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin.slug );
			}
			return Object.assign( {}, plugin, pluginData );
		} );
	},

	allPluginsHaveWporgData() {
		const plugins = this.addWporgDataToPlugins( this.props.plugins );
		return ( plugins.length === filter( plugins, { wporg: true } ).length );
	},

	fetchInstallInstructions( props ) {
		props = props || this.props;
		if ( props.siteId && ! props.hasRequested ) {
			props.fetchInstallInstructions( props.siteId );
		}
	},

	componentDidMount() {
		window.addEventListener( 'beforeunload', this.warnIfNotFinished );
		this.props.requestSites();
		if ( this.props.siteId ) {
			this.fetchInstallInstructions();
		}

		page.exit( '/plugins/setup/*', ( context, next ) => {
			const confirmText = this.warnIfNotFinished( {} );
			if ( ! confirmText ) {
				return next();
			}
			if ( window.confirm( confirmText ) ) { // eslint-disable-line no-aler
				next();
			} else {
				// save off the current path just in case context changes after this call
				const currentPath = context.canonicalPath;
				setTimeout( function() {
					page.replace( currentPath, null, false, false );
				}, 0 );
			}
		} );
	},

	componentWillUnmount() {
		window.removeEventListener( 'beforeunload', this.warnIfNotFinished );
	},

	componentWillReceiveProps( props ) {
		this.fetchInstallInstructions( props );
	},

	componentDidUpdate() {
		const site = this.props.selectedSite;
		if ( site &&
			site.jetpack &&
			site.canUpdateFiles &&
			site.canManage() &&
			this.allPluginsHaveWporgData() &&
			! this.props.isInstalling &&
			this.props.nextPlugin
		) {
			this.startNextPlugin( this.props.nextPlugin );
		}
	},

	warnIfNotFinished( event ) {
		const site = this.props.selectedSite;
		if ( ! site ||
			! site.jetpack ||
			! site.canUpdateFiles ||
			! site.canManage() ||
			this.props.isFinished
		) {
			return;
		}
		const beforeUnloadText = this.translate( 'We haven\'t finished installing your plugins.' );
		( event || window.event ).returnValue = beforeUnloadText;
		return beforeUnloadText;
	},

	startNextPlugin( plugin ) {
		const install = this.props.installPlugin;
		const site = this.props.selectedSite;

		// Merge wporg info into the plugin object
		plugin = Object.assign( {}, plugin, getPlugin( this.props.wporg, plugin.slug ) );

		const getPluginFromStore = function() {
			const sitePlugin = PluginsStore.getSitePlugin( site, plugin.slug );
			if ( ! sitePlugin && PluginsStore.isFetchingSite( site ) ) {
				// if the Plugins are still being fetched, we wait. We are not using flux
				// store events because it would be more messy to handle the one-time-only
				// callback with bound parameters than to do it this way.
				return setTimeout( getPluginFromStore, 500 );
			}
			// Merge any site-specific info into the plugin object, setting a default plugin ID if needed
			plugin = Object.assign( { id: plugin.slug }, plugin, sitePlugin );
			install( plugin, site );
		};
		getPluginFromStore();
	},

	renderNoJetpackSiteSelected() {
		return (
			<JetpackManageErrorPage
				site={ this.props.selectedSite }
				title={ this.translate( 'Oh no! You need to select a jetpack site to be able to setup your plan' ) }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' } />
		);
	},

	renderCantInstallPlugins() {
		const site = this.props.selectedSite;
		const reasons = utils.getSiteFileModDisableReason( site, 'modifyFiles' );
		let reason;

		if ( reasons && reasons.length > 0 ) {
			reason = reasons[ 0 ];
		} else if ( ! site.hasMinimumJetpackVersion ) {
			reason = this.translate( 'You need to update your version of Jetpack.' );
		} else if ( ! site.isMainNetworkSite() ) {
			reason = this.translate( 'We can\'t install plugins on multisite sites.' );
		} else if ( site.options.is_multi_network ) {
			reason = this.translate( 'We can\'t install plugins on multi-network sites.' );
		}

		return (
			<JetpackManageErrorPage
				site={ this.props.selectedSite }
				action={ this.translate( 'Contact Support' ) }
				actionURL={ support.JETPACK_CONTACT_SUPPORT }
				title={ this.translate( 'Oh no! We can\'t install plugins on this site.' ) }
				line={ reason }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' } />
		);
	},

	renderNoJetpackPlan() {
		return (
			<div>
				<h1 className="jetpack-plugins-setup__header">{ this.translate( 'Nothing to do here…' ) }</h1>
			</div>
		);
	},

	renderPluginsPlaceholders() {
		const placeholderCount = 3;
		return range( placeholderCount ).map( i => <PluginItem key={ 'placeholder-' + i } /> );
	},

	renderPlugins( hidden = false ) {
		const site = this.props.selectedSite;
		if ( this.props.isRequesting || PluginsStore.isFetchingSite( site ) ) {
			return this.renderPluginsPlaceholders();
		}

		const plugins = this.addWporgDataToPlugins( this.props.plugins );

		return plugins.map( ( item, i ) => {
			const plugin = Object.assign( {}, item, getPlugin( this.props.wporg, item.slug ) );

			return (
				<CompactCard className="plugin-item" key={ i }>
					<span className="plugin-item__link">
						<PluginIcon image={ plugin.icon } />
						<div className="plugin-item__title">
							{ plugin.name }
						</div>
						{ hidden
							? <Notice
								key={ 0 }
								isCompact={ true }
								showDismiss={ false }
								icon="plugins"
								text={ this.translate( 'Waiting to install' ) } />
							: this.renderStatus( plugin )
						}
					</span>
					{ this.renderActions( plugin ) }
				</CompactCard>
			);
		} );
	},

	renderStatus( plugin ) {
		const statusProps = {
			isCompact: true,
			status: 'is-info',
			showDismiss: false,
		};

		if ( plugin.error ) {
			statusProps.status = 'is-error';
			switch ( plugin.status ) {
				case 'install':
					statusProps.text = this.translate( 'An error occured when installing %(plugin)s.', { args: { plugin: plugin.name } } );
					break;
				case 'activate':
					statusProps.text = this.translate( 'An error occured when activating %(plugin)s.', { args: { plugin: plugin.name } } );
					break;
				case 'configure':
					statusProps.text = this.translate( 'An error occured when configuring %(plugin)s.', { args: { plugin: plugin.name } } );
					break;
				default:
					statusProps.text = this.translate( 'An error occured.' );
					break;
			}
			statusProps.children = (
				<NoticeAction key="notice_action" href={ helpLinks[ plugin.slug ] }>
					{ this.translate( 'Manual Installation' ) }
				</NoticeAction>
			);
		} else {
			statusProps.icon = 'plugins';
			statusProps.status = 'is-info';
			switch ( plugin.status ) {
				case 'done':
					// Done doesn't use a notice
					return (
						<div className="plugin-item__finished">
							{ this.translate( 'Successfully installed & configured.' ) }
						</div>
					);
				case 'activate':
				case 'configure':
					statusProps.text = this.translate( 'Almost done' );
					break;
				case 'install':
					statusProps.text = this.translate( 'Working…' );
					break;
				case 'wait':
				default:
					statusProps.text = this.translate( 'Waiting to install' );
			}
		}

		return ( <Notice { ...statusProps } /> );
	},

	renderActions( plugin ) {
		if ( plugin.status === 'wait' ) {
			return null;
		} else if ( plugin.error !== null ) {
			return null;
		} else if ( plugin.status !== 'done' ) {
			return (
				<div className="plugin-item__actions">
					<Spinner />
				</div>
			);
		}

		return null;
	},

	renderSuccess() {
		let noticeText;
		const site = this.props.selectedSite;
		if ( ! this.props.hasRequested || ! this.props.isFinished ) {
			return null;
		}

		const plugins = this.addWporgDataToPlugins( this.props.plugins );
		const pluginsWithErrors = filter( plugins, ( item ) => {
			return ( item.error !== null );
		} );

		if ( pluginsWithErrors.length ) {
			if ( pluginsWithErrors.length === 1 ) {
				noticeText = this.translate(
					'There was an issue installing %(plugin)s. ' +
					'It may be possible to fix this by {{a}}manually installing{{/a}} the plugin.',
					{
						args: {
							plugin: pluginsWithErrors[ 0 ].name,
						},
						components: {
							a: <a href={ support.JETPACK_SUPPORT } />
						}
					}
				);
			} else {
				noticeText = this.translate(
					'There were some issues installing your plugins. ' +
					'It may be possible to fix this by {{a}}manually installing{{/a}} the plugins.',
					{
						components: {
							a: <a href={ support.JETPACK_SUPPORT } />
						}
					}
				);
			}
			return (
				<Notice status="is-error" text={ noticeText } showDismiss={ false }>
					<NoticeAction href={ support.JETPACK_SUPPORT }>
						{ this.translate( 'Contact Support' ) }
					</NoticeAction>
				</Notice>
			);
		}

		noticeText = this.translate( 'We\'ve installed your plugins, your site is powered up!' );
		return (
			<Notice status="is-success" text={ noticeText } showDismiss={ false }>
				<NoticeAction href={ `/stats/insights/${site.slug}` }>
					{ this.translate( 'Continue' ) }
				</NoticeAction>
			</Notice>
		);
	},

	renderPlaceholder() {
		return (
			<div className="jetpack-plugins-setup">
				<h1 className="jetpack-plugins-setup__header is-placeholder">
					{ this.translate( 'Setting up your plan' ) }
				</h1>
				<p className="jetpack-plugins-setup__description is-placeholder">
					{ this.translate( 'We need to install a few plugins for you. It won\'t take long!' ) }
				</p>
				{ this.renderPluginsPlaceholders() }
			</div>
		);
	},

	render() {
		const site = this.props.selectedSite;

		if ( ! site && ! this.props.isRequestingSites ) {
			return this.renderPlaceholder();
		}

		if ( ! site || ! site.jetpack ) {
			return this.renderNoJetpackSiteSelected();
		}

		if ( ! site.canUpdateFiles ) {
			return this.renderCantInstallPlugins();
		}

		if ( site &&
			! this.props.isRequestingSites &&
			! this.props.isRequesting &&
			! PluginsStore.isFetchingSite( site ) &&
			! this.props.plugins.length ) {
			return this.renderNoJetpackPlan();
		}

		let turnOnManage;
		if ( site && ! site.canManage() ) {
			const manageUrl = site.getRemoteManagementURL() + '&section=plugins';
			turnOnManage = (
				<Card className="jetpack-plugins-setup__need-manage">
					<p>{
						this.translate(
							'{{strong}}Jetpack Manage must be enabled for us to auto-configure your %(plan)s plan.{{/strong}} This will allow WordPress.com to communicate with your site and auto-configure the features unlocked with your new plan. Or you can opt out.', // eslint-disable-line max-len
							{
								args: { plan: site.plan.product_name_short },
								components: { strong: <strong /> }
							}
						)
					}</p>
					<Button primary href={ manageUrl }>{ this.translate( 'Enable Manage' ) }</Button>
					<Button href={ support.JETPACK_SUPPORT }>
						{ this.translate( 'Manual Installation' ) }
					</Button>
				</Card>
			);
		}

		return (
			<div className="jetpack-plugins-setup">
				<h1 className="jetpack-plugins-setup__header">
					{ this.translate( 'Setting up your %(plan)s Plan', { args: { plan: site.plan.product_name_short } } ) }
				</h1>
				<p className="jetpack-plugins-setup__description">
					{ this.translate( 'We need to install a few plugins for you. It won\'t take long!' ) }
				</p>
				{ turnOnManage }
				{ ! turnOnManage && this.renderSuccess() }
				{ turnOnManage
					? <FeatureExample>{ this.renderPlugins( true ) }</FeatureExample>
					: this.renderPlugins( false )
				}
			</div>
		);
	}
} );

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const site = sites.getSelectedSite();
		return {
			wporg: state.plugins.wporg.items,
			isRequesting: isRequesting( state, siteId ),
			hasRequested: hasRequested( state, siteId ),
			isInstalling: isInstalling( state, siteId ),
			isFinished: isFinished( state, siteId ),
			plugins: getPluginsForSite( state, siteId ),
			activePlugin: getActivePlugin( state, siteId ),
			nextPlugin: getNextPlugin( state, siteId ),
			selectedSite: site && site.jetpack ? JetpackSite( site ) : site,
			isRequestingSites: isRequestingSites( state ),
			siteId
		};
	},
	dispatch => bindActionCreators( { requestSites, fetchPluginData, fetchInstallInstructions, installPlugin }, dispatch )
)( PlansSetup );
