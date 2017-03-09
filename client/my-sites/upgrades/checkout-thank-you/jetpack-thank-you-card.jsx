/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import filter from 'lodash/filter';
import range from 'lodash/range';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanThankYouCard from 'blocks/plan-thank-you-card';
import FeatureExample from 'components/feature-example';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import Gridicon from 'gridicons';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import analytics from 'lib/analytics';
import JetpackSite from 'lib/site/jetpack';
import support from 'lib/url/support';

// Redux actions & selectors
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackSite, isRequestingSites, getRawSite } from 'state/sites/selectors';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { requestSites } from 'state/sites/actions';
import {
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
import ProgressBar from 'components/progress-bar';

class JetpackThankYouCard extends Component {
	trackConfigFinished( eventName, options = null ) {
		if ( ! this.sentTracks ) {
			analytics.tracks.recordEvent( eventName, options );
		}
		this.sentTracks = true;
	}

	trackManualInstall() {
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_click_manual_error' );
	}

	trackManagePlans() {
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_click_manage_plans' );
	}

	trackContactSupport() {
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_click_contact_support' );
	}

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins( plugins ) {
		return plugins.map( plugin => {
			const pluginData = getPlugin( this.props.wporg, plugin.slug );
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin.slug );
			}
			return Object.assign( {}, plugin, pluginData );
		} );
	}

	allPluginsHaveWporgData() {
		const plugins = this.addWporgDataToPlugins( this.props.plugins );
		return ( plugins.length === filter( plugins, { wporg: true } ).length );
	}

	componentDidMount() {
		window.addEventListener( 'beforeunload', this.warnIfNotFinished );
		this.props.requestSites();

		page.exit( '/checkout/thank-you/*', ( context, next ) => {
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
	}

	componentWillUnmount() {
		window.removeEventListener( 'beforeunload', this.warnIfNotFinished );
	}

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
	}

	warnIfNotFinished( event ) {
		const site = this.props && this.props.selectedSite;
		if ( ! site ||
			! site.jetpack ||
			! site.canUpdateFiles ||
			! site.canManage() ||
			this.props.isFinished
		) {
			return;
		}
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_user_interrupt' );
		const beforeUnloadText = this.props.translate( 'We haven\'t finished installing your plugins.' );
		( event || window.event ).returnValue = beforeUnloadText;
		return beforeUnloadText;
	}

	startNextPlugin( plugin ) {
		// We're already installing.
		if ( this.props.isInstalling ) {
			return;
		}

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
	}

	renderPlugin( key = 0, plugin ) {
		const classes = classNames( 'checkout-thank-you__jetpack-plugin', {
			'is-placeholder': ! plugin
		} );
		return (
			<div key={ key } className={ classes } >
				<div className="checkout-thank-you__jetpack-plugin-status-icon">
					<span>
						{ plugin
							? this.getStatusIcon( plugin )
							: this.getStatusIcon( { status: 'placeholder' } )
						}
					</span>
				</div>
				<div className="checkout-thank-you__jetpack-plugin-status-text">
					<span>
						{ plugin
							? this.getStatusText( plugin )
							: this.getStatusText( {
								slug: 'placeholder',
								status: 'placeholder'
							} )
						}
					</span>
				</div>
			</div>
		);
	}

	renderFeaturePlaceholders() {
		const placeholderCount = !! this.props.whitelist ? 1 : 3;
		return range( placeholderCount ).map( i => {
			return this.renderPlugin( i );
		} );
	}

	renderPlugins() {
		const site = this.props.selectedSite;
		let mappedPlugins;
		if ( ! this.props.hasRequested || this.props.isRequesting || PluginsStore.isFetchingSite( site ) ) {
			mappedPlugins = this.renderFeaturePlaceholders();
		} else {
			const plugins = this.addWporgDataToPlugins( this.props.plugins );
			mappedPlugins = plugins.map( ( item ) => {
				const plugin = Object.assign( {}, item, getPlugin( this.props.wporg, item.slug ) );
				return this.renderPlugin( plugin.slug, plugin );
			} );
		}

		return (
			<div className="checkout-thank-you__jetpack-plugins">
				{ mappedPlugins }
			</div>
		);
	}

	getStatusIcon( plugin ) {
		switch ( plugin.status ) {
			case 'done':
				return <Gridicon icon="checkmark" size={ 18 } />;
			case 'placeholder':
				return 'x';
			default:
				return <Spinner size={ 18 } />;
		}
	}

	getStatusText( plugin ) {
		const { translate } = this.props;

		if ( 'vaultpress' === plugin.slug ) {
			switch ( plugin.status ) {
				case 'done':
					return translate( 'Backups and security active' );
				default:
					return translate( 'Activating backups and security' );
			}
		} else if ( 'akismet' === plugin.slug ) {
			switch ( plugin.status ) {
				case 'done':
					return translate( 'Spam protection active' );
				default:
					return translate( 'Activating spam protection' );
			}
		}

		switch ( plugin.status ) {
			case 'done':
				return translate( 'Successfully installed & configured.' );
			default:
				return translate( 'Installing and configuring' );
		}
	}

	isErrored() {
		const { selectedSite } = this.props;
		return selectedSite && ! selectedSite.canUpdateFiles;
	}

	renderErrorNotice() {
		const { translate } = this.props;
		if ( ! this.isErrored() ) {
			return null;
		}

		return (
			<Notice
				className="checkout-thank-you__jetpack-error-notice"
				showDismiss={ false }
				status="is-error"
				text={ translate( 'We had trouble setting up your plan.' ) }
				>
				<NoticeAction href={ support.JETPACK_CONTACT_SUPPORT }>
					{ translate( 'Get Help' ) }
				</NoticeAction>
			</Notice>
		);
	}

	renderManageNotice() {
		const { translate, selectedSite } = this.props;
		const manageUrl = selectedSite.getRemoteManagementURL() + '&section=plugins-setup';
		return (
			<Notice
				className="checkout-thank-you__jetpack-manage-notice"
				showDismiss={ false }
				status="is-warning"
				text={ translate(
					'Jetpack Manage must be enabled for us to auto-configure your %(plan)s plan.',
					{
						args: { plan: selectedSite.plan.product_name_short }
					}
				) }
				>
				<NoticeAction href={ manageUrl }>
					{ translate( 'Turn On Manage' ) }
				</NoticeAction>
			</Notice>
		);
	}

	renderAction() {
		const { plugins } = this.props;
		if ( ! plugins || ! Array.isArray( plugins ) ) {
			return null;
		}

		const countSteps = plugins.length * 4;
		const countCompletion = plugins.reduce( ( total, plugin ) => {
			switch ( plugin.status ) {
				case 'done':
					total += 4;
					break;
				case 'activate':
				case 'configure':
					total += 3;
					break;
				case 'install':
					total += 2;
					break;
				case 'wait':
				default:
					total += 1;
					break;
			}

			return total;
		}, 0 );

		if ( countSteps === countCompletion ) {
			return null;
		}

		return (
			<ProgressBar value={ countCompletion } total={ countSteps } isPulsing />
		);
	}

	render() {
		const site = this.props.selectedSite;
		const turnOnManage = site && ! site.canManage();
		if ( ! site && this.props.isRequestingSites ) {
			return (
				<div className="checkout-thank-you__jetpack">
					<PlanThankYouCard />
				</div>
			);
		}

		return (
			<div className="checkout-thank-you__jetpack">
				<QueryPluginKeys siteId={ site.ID } />
				{ this.renderErrorNotice() }
				{ turnOnManage && this.renderManageNotice() }
				<PlanThankYouCard siteId={ site.ID } action={ this.renderAction() } />
				{ turnOnManage
					? <FeatureExample>{ this.renderPlugins() }</FeatureExample>
					: this.renderPlugins()
				}
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const whitelist = ownProps.whitelist || false;

		// We need to pass the raw redux site to JetpackSite() in order to properly build the site.
		const selectedSite = site && isJetpackSite( state, siteId )
			? JetpackSite( getRawSite( state, siteId ) )
			: site;

		return {
			wporg: state.plugins.wporg.items,
			isRequesting: isRequesting( state, siteId ),
			hasRequested: hasRequested( state, siteId ),
			isInstalling: isInstalling( state, siteId, whitelist ),
			isFinished: isFinished( state, siteId, whitelist ),
			plugins: getPluginsForSite( state, siteId, whitelist ),
			activePlugin: getActivePlugin( state, siteId, whitelist ),
			nextPlugin: getNextPlugin( state, siteId, whitelist ),
			selectedSite: selectedSite,
			isRequestingSites: isRequestingSites( state ),
			siteId
		};
	},
	dispatch => bindActionCreators( { requestSites, fetchPluginData, installPlugin }, dispatch )
)( localize( JetpackThankYouCard ) );
