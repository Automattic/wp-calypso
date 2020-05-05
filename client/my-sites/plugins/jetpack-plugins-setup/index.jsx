/**
 * External dependencies
 */
import React from 'react';
import page from 'page';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { filter, get, range } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import Spinner from 'components/spinner';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import PageViewTracker from 'lib/analytics/page-view-tracker';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item';
import { recordTracksEvent } from 'lib/analytics/tracks';
import {
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SERVICE_AKISMET,
	JETPACK_SERVICE_VAULTPRESS,
	JETPACK_SUPPORT,
} from 'lib/url/support';
import { getSiteFileModDisableReason } from 'lib/site/utils';

/**
 * Style dependencies
 */
import './style.scss';

// Redux actions & selectors
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isRequestingSites } from 'state/sites/selectors';
import hasInitializedSites from 'state/selectors/has-initialized-sites';
import { getPlugin } from 'state/plugins/wporg/selectors';
import { fetchPluginData } from 'state/plugins/wporg/actions';
import { requestSites } from 'state/sites/actions';
import { installPlugin } from 'state/plugins/premium/actions';
import {
	getPluginsForSite,
	getActivePlugin,
	getNextPlugin,
	isFinished,
	isInstalling,
	isRequesting,
	hasRequested,
} from 'state/plugins/premium/selectors';
// Store for existing plugins
import PluginsStore from 'lib/plugins/store';

const helpLinks = {
	vaultpress: JETPACK_SERVICE_VAULTPRESS,
	akismet: JETPACK_SERVICE_AKISMET,
};

class PlansSetup extends React.Component {
	static displayName = 'PlanSetup';
	sentTracks = false;

	trackConfigFinished = ( eventName, options = {} ) => {
		if ( ! this.sentTracks ) {
			recordTracksEvent( eventName, {
				location: 'jetpackPluginSetup',
				...options,
			} );
		}
		this.sentTracks = true;
	};

	trackManualInstall = () => {
		recordTracksEvent( 'calypso_plans_autoconfig_click_manual_error' );
	};

	trackManagePlans = () => {
		recordTracksEvent( 'calypso_plans_autoconfig_click_manage_plans' );
	};

	trackContactSupport = () => {
		recordTracksEvent( 'calypso_plans_autoconfig_click_contact_support' );
	};

	// plugins for Jetpack sites require additional data from the wporg-data store
	addWporgDataToPlugins = ( plugins ) => {
		return plugins.map( ( plugin ) => {
			const pluginData = getPlugin( this.props.wporg, plugin.slug );
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin.slug );
			}
			return Object.assign( {}, plugin, pluginData );
		} );
	};

	allPluginsHaveWporgData = () => {
		const plugins = this.addWporgDataToPlugins( this.props.plugins );
		return plugins.length === filter( plugins, { wporg: true } ).length;
	};

	componentDidMount() {
		window.addEventListener( 'beforeunload', this.warnIfNotFinished );
		this.props.requestSites();

		page.exit( '/plugins/setup/*', ( context, next ) => {
			const confirmText = this.warnIfNotFinished( {} );
			if ( ! confirmText ) {
				return next();
			}
			if ( window.confirm( confirmText ) ) {
				next();
			} else {
				// save off the current path just in case context changes after this call
				const currentPath = context.canonicalPath;
				setTimeout( function () {
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
		if (
			site &&
			site.jetpack &&
			site.canUpdateFiles &&
			this.allPluginsHaveWporgData() &&
			! this.props.isInstalling &&
			this.props.nextPlugin
		) {
			this.startNextPlugin( this.props.nextPlugin );
		}
	}

	warnIfNotFinished = ( event ) => {
		const site = this.props.selectedSite;
		if ( ! site || ! site.jetpack || ! site.canUpdateFiles || this.props.isFinished ) {
			return;
		}
		recordTracksEvent( 'calypso_plans_autoconfig_user_interrupt' );
		const beforeUnloadText = this.props.translate( "We haven't finished installing your plugins." );
		( event || window.event ).returnValue = beforeUnloadText;
		return beforeUnloadText;
	};

	startNextPlugin = ( plugin ) => {
		// We're already installing.
		if ( this.props.isInstalling ) {
			return;
		}

		const install = this.props.installPlugin;
		const site = this.props.selectedSite;

		// Merge wporg info into the plugin object
		plugin = Object.assign( {}, plugin, getPlugin( this.props.wporg, plugin.slug ) );

		const getPluginFromStore = function () {
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
	};

	renderNoJetpackSiteSelected = () => {
		this.trackConfigFinished( 'calypso_plans_autoconfig_error', {
			error: 'wordpresscom',
		} );
		return (
			<JetpackManageErrorPage
				siteId={ this.props.siteId }
				title={ this.props.translate(
					'Oh no! You need to select a Jetpack site to be able to setup your plan'
				) }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' }
			/>
		);
	};

	renderCantInstallPlugins = () => {
		const { translate } = this.props;
		const site = this.props.selectedSite;
		const reasons = getSiteFileModDisableReason( site, 'modifyFiles' );
		let reason;

		if ( reasons && reasons.length > 0 ) {
			reason = reasons[ 0 ];
			this.trackConfigFinished( 'calypso_plans_autoconfig_error', {
				error: 'cannot_update_files',
				reason,
			} );
		} else if ( ! site.isMainNetworkSite ) {
			reason = translate( "We can't install plugins on multisite sites." );
			this.trackConfigFinished( 'calypso_plans_autoconfig_error', {
				error: 'secondary_network_site',
			} );
		} else if ( site.options.is_multi_network ) {
			reason = translate( "We can't install plugins on multi-network sites." );
			this.trackConfigFinished( 'calypso_plans_autoconfig_error', {
				error: 'multinetwork',
			} );
		}

		return (
			<JetpackManageErrorPage
				siteId={ this.props.siteId }
				action={ translate( 'Contact Support' ) }
				actionURL={ JETPACK_CONTACT_SUPPORT }
				title={ translate( "Oh no! We can't install plugins on this site." ) }
				line={ reason }
				illustration={ '/calypso/images/jetpack/jetpack-manage.svg' }
			/>
		);
	};

	renderNoJetpackPlan = () => {
		return (
			<div>
				<h1 className="jetpack-plugins-setup__header">
					{ this.props.translate( 'Nothing to do here…' ) }
				</h1>
			</div>
		);
	};

	renderPluginsPlaceholders = () => {
		const placeholderCount = this.props.whitelist ? 1 : 2;
		return range( placeholderCount ).map( ( i ) => <PluginItem key={ 'placeholder-' + i } /> );
	};

	renderPlugins = ( hidden = false ) => {
		const site = this.props.selectedSite;
		if ( this.props.isRequesting || PluginsStore.isFetchingSite( site ) ) {
			return this.renderPluginsPlaceholders();
		}

		const plugins = this.addWporgDataToPlugins( this.props.plugins );

		return plugins.map( ( item, i ) => {
			const plugin = Object.assign( {}, item, getPlugin( this.props.wporg, item.slug ) );

			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<CompactCard className="plugin-item" key={ i }>
					<span className="plugin-item__link">
						<PluginIcon image={ plugin.icon } />
						<div className="plugin-item__info">
							<div className="plugin-item__title">{ plugin.name }</div>
							{ hidden ? (
								<Notice
									key={ 0 }
									isCompact={ true }
									showDismiss={ false }
									icon="plugins"
									text={ this.props.translate( 'Waiting to install' ) }
								/>
							) : (
								this.renderStatus( plugin )
							) }
						</div>
					</span>
					{ this.renderActions( plugin ) }
				</CompactCard>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		} );
	};

	renderStatus = ( plugin ) => {
		if ( plugin.error ) {
			return this.renderStatusError( plugin );
		}

		if ( 'done' === plugin.status ) {
			// eslint-disable-next-line wpcalypso/jsx-classname-namespace
			return <div className="plugin-item__finished">{ this.getStatusText( plugin ) }</div>;
		}

		const statusProps = {
			isCompact: true,
			status: 'is-info',
			showDismiss: false,
			icon: 'plugins',
		};

		return <Notice { ...statusProps } text={ this.getStatusText( plugin ) } />;
	};

	getStatusText = ( plugin ) => {
		const { translate } = this.props;
		switch ( plugin.status ) {
			case 'done':
				return translate( 'Successfully installed & configured.' );
			case 'activate':
			case 'configure':
				return translate( 'Almost done' );
			case 'install':
				return translate( 'Working…' );
			case 'wait':
			default:
				return translate( 'Waiting to install' );
		}
	};

	renderStatusError = ( plugin ) => {
		const { translate } = this.props;

		// This state isn't quite an error
		if ( plugin.error.code === 'already_registered' ) {
			return (
				<Notice
					showDismiss={ false }
					isCompact={ true }
					status="is-info"
					text={ translate( 'This plugin is already registered with another plan.' ) }
				>
					<NoticeAction key="notice_action" href="/me/purchases" onClick={ this.trackManagePlans }>
						{ translate( 'Manage Plans' ) }
					</NoticeAction>
				</Notice>
			);
		}

		const statusProps = {
			isCompact: true,
			status: 'is-error',
			showDismiss: false,
		};
		statusProps.children = (
			<NoticeAction
				key="notice_action"
				href={ helpLinks[ plugin.slug ] }
				onClick={ this.trackManualInstall }
			>
				{ translate( 'Manual Installation' ) }
			</NoticeAction>
		);

		const errorMessage = get( plugin, 'error.message', '' );

		switch ( plugin.status ) {
			case 'install':
				return (
					<Notice
						{ ...statusProps }
						text={ translate( 'An error occurred when installing %(plugin)s.', {
							args: { plugin: plugin.name },
						} ) }
					/>
				);
			case 'activate':
				return (
					<Notice
						{ ...statusProps }
						text={ translate( 'An error occurred when activating %(plugin)s.', {
							args: { plugin: plugin.name },
						} ) }
					/>
				);
			case 'configure':
				return (
					<Notice
						{ ...statusProps }
						text={ translate( 'An error occurred when configuring %(plugin)s.', {
							args: { plugin: plugin.name },
						} ) }
					/>
				);
			default:
				return (
					<Notice
						{ ...statusProps }
						text={
							errorMessage
								? errorMessage.replace( /<.[^<>]*?>/g, '' )
								: translate( 'An error occured.' )
						}
					/>
				);
		}
	};

	renderActions = ( plugin ) => {
		if ( plugin.status === 'wait' ) {
			return null;
		} else if ( plugin.error !== null ) {
			return null;
		} else if ( plugin.status !== 'done' ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="plugin-item__actions">
					<Spinner />
				</div>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		return null;
	};

	renderErrorMessage = ( plugins ) => {
		let noticeText;
		const { translate } = this.props;
		const pluginsWithErrors = this.addWporgDataToPlugins( plugins );

		const tracksData = {};
		pluginsWithErrors.map( ( item ) => {
			tracksData[ item.slug ] = item.error.name + ': ' + item.error.message;
		} );

		this.trackConfigFinished( 'calypso_plans_autoconfig_error', {
			...tracksData,
			error: 'plugin',
		} );

		if ( pluginsWithErrors.length === 1 ) {
			noticeText = translate(
				'There was an issue installing %(plugin)s. ' +
					'It may be possible to fix this by {{a}}manually installing{{/a}} the plugin.',
				{
					args: {
						plugin: pluginsWithErrors[ 0 ].name,
					},
					components: {
						a: <a href={ JETPACK_SUPPORT } onClick={ this.trackManualInstall } />,
					},
				}
			);
		} else {
			noticeText = translate(
				'There were some issues installing your plugins. ' +
					'It may be possible to fix this by {{a}}manually installing{{/a}} the plugins.',
				{
					components: {
						a: <a href={ JETPACK_SUPPORT } onClick={ this.trackManualInstall } />,
					},
				}
			);
		}
		return (
			<Notice status="is-error" text={ noticeText } showDismiss={ false }>
				<NoticeAction href={ JETPACK_CONTACT_SUPPORT } onClick={ this.trackContactSupport }>
					{ translate( 'Contact Support' ) }
				</NoticeAction>
			</Notice>
		);
	};

	renderSuccess = () => {
		const { translate } = this.props;
		const site = this.props.selectedSite;
		if ( ! this.props.hasRequested || ! this.props.isFinished ) {
			return null;
		}

		const pluginsWithErrors = filter( this.props.plugins, ( item ) => {
			const errorCode = get( item, 'error.code', null );
			return errorCode && errorCode !== 'already_registered';
		} );

		if ( pluginsWithErrors.length ) {
			return this.renderErrorMessage( pluginsWithErrors );
		}

		this.trackConfigFinished( 'calypso_plans_autoconfig_success' );

		const noticeText = translate(
			"We've set up your plugin, your site is powered up!",
			"We've set up your plugins, your site is powered up!",
			{ count: this.props.plugins.length }
		);
		return (
			<Notice status="is-success" text={ noticeText } showDismiss={ false }>
				<NoticeAction href={ `/plans/my-plan/${ site.slug }` }>
					{ translate( 'Continue' ) }
				</NoticeAction>
			</Notice>
		);
	};

	renderPlaceholder = () => {
		const { translate } = this.props;
		return (
			<div className="jetpack-plugins-setup">
				<h1 className="jetpack-plugins-setup__header is-placeholder">
					{ translate( 'Setting up your plan' ) }
				</h1>
				<p className="jetpack-plugins-setup__description is-placeholder">
					{ translate( "We need to install a few plugins for you. It won't take long!" ) }
				</p>
				{ this.renderPluginsPlaceholders() }
			</div>
		);
	};

	render() {
		const { sitesInitialized, translate } = this.props;
		const site = this.props.selectedSite;

		if ( ! site && ( this.props.isRequestingSites || ! sitesInitialized ) ) {
			return this.renderPlaceholder();
		}

		if ( ! site || ! site.jetpack ) {
			return this.renderNoJetpackSiteSelected();
		}

		if ( ! site.canUpdateFiles ) {
			return this.renderCantInstallPlugins();
		}

		if (
			site &&
			! this.props.isRequestingSites &&
			! this.props.isRequesting &&
			! PluginsStore.isFetchingSite( site ) &&
			! this.props.plugins.length
		) {
			return this.renderNoJetpackPlan();
		}

		return (
			<div className="jetpack-plugins-setup">
				<PageViewTracker path="/plugins/setup/:site" title="Jetpack Plugins Setup" />
				<QueryPluginKeys siteId={ site.ID } />
				<h1 className="jetpack-plugins-setup__header">
					{ translate( 'Setting up your %(plan)s Plan', {
						args: { plan: site.plan.product_name_short },
					} ) }
				</h1>
				<p className="jetpack-plugins-setup__description">
					{ translate( "We need to install a few plugins for you. It won't take long!" ) }
				</p>
				{ this.renderSuccess() }
				{ this.renderPlugins( false ) }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const selectedSite = getSelectedSite( state );
		const whitelist = ownProps.whitelist || false;

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
			sitesInitialized: hasInitializedSites( state ),
			siteId,
		};
	},
	( dispatch ) => bindActionCreators( { requestSites, fetchPluginData, installPlugin }, dispatch )
)( localize( PlansSetup ) );
