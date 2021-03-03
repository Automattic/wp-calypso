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
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import Spinner from 'calypso/components/spinner';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import QueryPluginKeys from 'calypso/components/data/query-plugin-keys';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import JetpackManageErrorPage from 'calypso/my-sites/jetpack-manage-error-page';
import PluginItem from 'calypso/my-sites/plugins/plugin-item/plugin-item';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	JETPACK_CONTACT_SUPPORT,
	JETPACK_SERVICE_AKISMET,
	JETPACK_SERVICE_VAULTPRESS,
	JETPACK_SUPPORT,
} from 'calypso/lib/url/support';
import { getSiteFileModDisableReason } from 'calypso/lib/site/utils';

/**
 * Style dependencies
 */
import './style.scss';

// Redux actions & selectors
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isRequestingSites } from 'calypso/state/sites/selectors';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { getAllPlugins as getAllWporgPlugins } from 'calypso/state/plugins/wporg/selectors';
import { fetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { requestSites } from 'calypso/state/sites/actions';
import { installPlugin } from 'calypso/state/plugins/premium/actions';
import {
	getPluginsForSite,
	getActivePlugin,
	getNextPlugin,
	isFinished,
	isInstalling,
	isRequesting,
	hasRequested,
} from 'calypso/state/plugins/premium/selectors';
import {
	getPluginOnSite,
	isRequesting as isRequestingInstalledPlugins,
} from 'calypso/state/plugins/installed/selectors';

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
			const pluginData = this.props.wporgPlugins?.[ plugin.slug ];
			if ( ! pluginData ) {
				this.props.fetchPluginData( plugin.slug );
			}
			return { ...plugin, ...pluginData };
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
			this.startNextPlugin();
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

	startNextPlugin = () => {
		const { nextPlugin, requestingInstalledPlugins, sitePlugin } = this.props;

		// We're already installing.
		if ( this.props.isInstalling ) {
			return;
		}

		const install = this.props.installPlugin;
		const site = this.props.selectedSite;

		// Merge wporg info into the plugin object
		let plugin = { ...nextPlugin, ...this.props.wporgPlugins?.[ nextPlugin.slug ] };

		const getPluginFromStore = function () {
			if ( ! sitePlugin && requestingInstalledPlugins ) {
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
		const placeholderCount = this.props.forSpecificPlugin ? 1 : 2;
		return range( placeholderCount ).map( ( i ) => <PluginItem key={ 'placeholder-' + i } /> );
	};

	renderPlugins = ( hidden = false ) => {
		if ( this.props.isRequesting || this.props.requestingInstalledPlugins ) {
			return this.renderPluginsPlaceholders();
		}

		const plugins = this.addWporgDataToPlugins( this.props.plugins );

		return plugins.map( ( item, i ) => {
			const plugin = { ...item, ...this.props.wporgPlugins?.[ item.slug ] };

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
		const { siteId, sitesInitialized, translate } = this.props;
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
			! this.props.requestingInstalledPlugins &&
			! this.props.plugins.length
		) {
			return this.renderNoJetpackPlan();
		}

		return (
			<div className="jetpack-plugins-setup">
				<PageViewTracker path="/plugins/setup/:site" title="Jetpack Plugins Setup" />
				<QueryPluginKeys siteId={ site.ID } />
				{ siteId && <QueryJetpackPlugins siteIds={ [ siteId ] } /> }
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
		const forSpecificPlugin = ownProps.forSpecificPlugin || false;

		return {
			sitePlugin: forSpecificPlugin && getPluginOnSite( state, siteId, forSpecificPlugin ),
			wporgPlugins: getAllWporgPlugins( state ),
			isRequesting: isRequesting( state, siteId ),
			requestingInstalledPlugins: isRequestingInstalledPlugins( state, siteId ),
			hasRequested: hasRequested( state, siteId ),
			isInstalling: isInstalling( state, siteId, forSpecificPlugin ),
			isFinished: isFinished( state, siteId, forSpecificPlugin ),
			plugins: getPluginsForSite( state, siteId, forSpecificPlugin ),
			activePlugin: getActivePlugin( state, siteId, forSpecificPlugin ),
			nextPlugin: getNextPlugin( state, siteId, forSpecificPlugin ),
			selectedSite: selectedSite,
			isRequestingSites: isRequestingSites( state ),
			sitesInitialized: hasInitializedSites( state ),
			siteId,
		};
	},
	( dispatch ) => bindActionCreators( { requestSites, fetchPluginData, installPlugin }, dispatch )
)( localize( PlansSetup ) );
