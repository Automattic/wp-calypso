/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { difference, filter, map, reduce, some } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import analytics from 'lib/analytics';
import { getSiteFileModDisableReason } from 'lib/site/utils';

// Redux actions & selectors
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import {
	getSite,
	getSiteAdminUrl,
	isJetpackSiteMainNetworkSite,
	isJetpackSiteMultiSite,
	isRequestingSites,
	getJetpackSiteRemoteManagementUrl,
} from 'state/sites/selectors';
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
import { getCurrentPlan } from 'state/sites/plans/selectors';
import {
	FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY,
	FEATURE_BACKUP_ARCHIVE_30,
	FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED,
	FEATURE_AUTOMATED_RESTORES,
	FEATURE_BACKUP_ARCHIVE_UNLIMITED,
	FEATURE_EASY_SITE_MIGRATION,
	FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND,
	FEATURE_ONE_CLICK_THREAT_RESOLUTION,
	FEATURE_SPAM_AKISMET_PLUS,
	getPlanClass,
} from 'lib/plans/constants';
import { getPlan } from 'lib/plans';

const vpFeatures = {
	[ FEATURE_OFFSITE_BACKUP_VAULTPRESS_DAILY ]: true,
	[ FEATURE_BACKUP_ARCHIVE_30 ]: true,
	[ FEATURE_BACKUP_STORAGE_SPACE_UNLIMITED ]: true,
	[ FEATURE_AUTOMATED_RESTORES ]: true,
	[ FEATURE_BACKUP_ARCHIVE_UNLIMITED ]: true,
	[ FEATURE_EASY_SITE_MIGRATION ]: true,
	[ FEATURE_MALWARE_SCANNING_DAILY_AND_ON_DEMAND ]: true,
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: true,
};

const akismetFeatures = {
	[ FEATURE_SPAM_AKISMET_PLUS ]: true,
};

export class JetpackPlanSetupRunner extends Component {
	state = {
		completedJetpackFeatures: {},
		installInitiatedPlugins: new Set(),
	};

	trackConfigFinished( eventName, options = null ) {
		if ( ! this.sentTracks ) {
			analytics.tracks.recordEvent( eventName, options );
		}
		this.sentTracks = true;
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
		return plugins.length === filter( plugins, { wporg: true } ).length;
	}

	componentDidMount() {
		window.addEventListener( 'beforeunload', this.warnIfNotFinished );
		this.props.requestSites();
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_start' );

		page.exit( '/checkout/thank-you/*', ( context, next ) => {
			const confirmText = this.warnIfNotFinished( {} );
			if ( ! confirmText ) {
				return next();
			}
			if ( window.confirm( confirmText ) ) {
				// eslint-disable-line no-aler
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
		const { nextPlugin, planFeatures, plugins, selectedSite: site } = this.props;
		const { completedJetpackFeatures } = this.state;

		if (
			! site ||
			! site.jetpack ||
			! site.canManage ||
			! this.allPluginsHaveWporgData() ||
			this.props.isInstalling
		) {
			return;
		}

		if (
			planFeatures &&
			! site.canUpdateFiles &&
			! Object.keys( completedJetpackFeatures ).length
		) {
			this.activateJetpackFeatures();
		}

		if ( site.canUpdateFiles && nextPlugin ) {
			this.startNextPlugin( nextPlugin );
		} else if (
			site.canUpdateFiles &&
			plugins &&
			! some( plugins, plugin => 'done' !== plugin.status ) &&
			! Object.keys( completedJetpackFeatures ).length
		) {
			this.activateJetpackFeatures();
		} else if (
			site.canUpdateFiles &&
			! nextPlugin &&
			! Object.keys( completedJetpackFeatures ).length
		) {
			this.activateJetpackFeatures();
		}
	}

	warnIfNotFinished( event ) {
		const site = this.props && this.props.selectedSite;
		if (
			! site ||
			! site.jetpack ||
			! site.canUpdateFiles ||
			! site.canManage ||
			this.props.isFinished
		) {
			return;
		}
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_user_interrupt' );
		const beforeUnloadText = this.props.translate( "We haven't finished installing your plugins." );
		( event || window.event ).returnValue = beforeUnloadText;
		return beforeUnloadText;
	}

	startNextPlugin( plugin ) {
		const { slug } = plugin;

		// We're already installing.
		if ( this.props.isInstalling || this.state.installInitiatedPlugins.has( slug ) ) {
			return;
		}

		const install = this.props.installPlugin;
		const site = this.props.selectedSite;

		// Merge wporg info into the plugin object
		plugin = Object.assign( {}, plugin, getPlugin( this.props.wporg, slug ) );

		const getPluginFromStore = function() {
			const sitePlugin = PluginsStore.getSitePlugin( site, slug );
			if ( ! sitePlugin && PluginsStore.isFetchingSite( site ) ) {
				// if the Plugins are still being fetched, we wait. We are not using flux
				// store events because it would be more messy to handle the one-time-only
				// callback with bound parameters than to do it this way.
				return setTimeout( getPluginFromStore, 500 );
			}
			// Merge any site-specific info into the plugin object, setting a default plugin ID if needed
			plugin = Object.assign( { id: slug }, plugin, sitePlugin );
			install( plugin, site );
		};

		// Redux state is not updated with installing plugins quickly enough.
		// Track installing plugins locally to avoid redundant install requests.
		this.setState(
			( { installInitiatedPlugins } ) => ( {
				installInitiatedPlugins: installInitiatedPlugins.add( slug ),
			} ),
			getPluginFromStore
		);
	}

	isErrored() {
		const { selectedSite, plugins } = this.props;
		return (
			( selectedSite && ! selectedSite.canUpdateFiles ) ||
			some(
				plugins,
				plugin => plugin.hasOwnProperty( 'error' ) && plugin.error && plugin.status !== 'done'
			)
		);
	}

	guessErrorReason() {
		const { isSiteMainNetworkSite, isSiteMultiSite, selectedSite, translate } = this.props;
		if ( ! this.isErrored() ) {
			return null;
		}

		const reasons = getSiteFileModDisableReason( selectedSite, 'modifyFiles' );
		let reason;
		if ( reasons && reasons.length > 0 ) {
			reason = translate( "We can't modify files on your site." );
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_filemod', { error: reason } );
		} else if ( selectedSite.hasMinimumJetpackVersion === false ) {
			reason = translate(
				'We are unable to set up your plan because your site has an older version of Jetpack. ' +
					'Please upgrade Jetpack.'
			);
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_jpversion', {
				jetpack_version: selectedSite.options.jetpack_version,
			} );
		} else if ( isSiteMultiSite && ! isSiteMainNetworkSite ) {
			reason = translate(
				'Your site is part of a multi-site network, but is not the main network site.'
			);

			this.trackConfigFinished( 'calypso_plans_autoconfig_error_multisite' );
		} else if ( selectedSite.options.is_multi_network ) {
			reason = translate( 'Your site is part of a multi-network.' );
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_multinetwork' );
		} else {
			const erroredPlugins = reduce(
				this.props.plugins,
				( erroredList, plugin ) => {
					if ( 'error' === plugin.status ) {
						erroredList.push( plugin.slug );
					}
					return erroredList;
				},
				[]
			);

			if ( 1 === erroredPlugins.length && -1 < erroredPlugins.indexOf( 'akismet' ) ) {
				reason = translate( "We can't automatically configure the Akismet plugin." );
			} else if ( 1 === erroredPlugins.length && -1 < erroredPlugins.indexOf( 'vaultpress' ) ) {
				reason = translate( "We can't automatically configure the VaultPress plugin." );
			} else {
				reason = translate(
					"We can't automatically configure the Akismet and VaultPress plugins."
				);
			}
			this.trackConfigFinished( 'calypso_plans_autoconfig_error' );
		}
		return reason;
	}

	renderErrorNotice() {
		const { translate } = this.props;
		if ( ! this.isErrored() ) {
			return null;
		}

		return (
			<Notice
				showDismiss={ false }
				status="is-error"
				text={ translate( 'We had trouble setting up your plan.' ) }
			/>
		);
	}

	renderManageNotice() {
		const { translate, selectedSite, remoteManagementUrl } = this.props;

		if ( ! selectedSite || selectedSite.canManage ) {
			return null;
		}

		const manageUrl = remoteManagementUrl + '&section=plugins-setup';

		return (
			<Notice
				showDismiss={ false }
				status="is-warning"
				text={ translate(
					'Jetpack Manage must be enabled for us to auto-configure your %(plan)s plan.',
					{
						args: { plan: selectedSite.plan.product_name_short },
					}
				) }
			>
				<NoticeAction href={ manageUrl }>{ translate( 'Turn On Manage' ) }</NoticeAction>
			</Notice>
		);
	}

	activateJetpackFeatures() {
		const { planFeatures } = this.props;
		if ( ! planFeatures ) {
			return false;
		}

		const jetpackFeatures = difference(
			planFeatures,
			Object.keys( vpFeatures ),
			Object.keys( akismetFeatures )
		);

		const completedJetpackFeatures = reduce(
			jetpackFeatures,
			( completed, feature ) => {
				completed[ feature ] = true;
				return completed;
			},
			{}
		);

		this.setState( {
			completedJetpackFeatures,
		} );
	}

	getFeaturesWithStatus() {
		const { planFeatures, selectedSite } = this.props;
		const { completedJetpackFeatures } = this.state;
		if ( ! planFeatures ) {
			return [];
		}

		const plugins =
			selectedSite && ! selectedSite.canUpdateFiles
				? [
						{ slug: 'vaultpress', status: 'wait', error: true },
						{ slug: 'akismet', status: 'wait', error: true },
				  ]
				: this.props.plugins;

		const pluginsStatus = reduce(
			plugins,
			( completed, plugin ) => {
				if ( 'done' === plugin.status ) {
					completed[ plugin.slug ] = 'done';
				} else if ( plugin.hasOwnProperty( 'error' ) && plugin.error ) {
					completed[ plugin.slug ] = 'error';
				} else {
					completed[ plugin.slug ] = 'wait';
				}
				return completed;
			},
			{}
		);

		return map( planFeatures, feature => {
			let status = 'wait';

			if ( vpFeatures.hasOwnProperty( feature ) && pluginsStatus.hasOwnProperty( 'vaultpress' ) ) {
				status = pluginsStatus.vaultpress;
			} else if (
				akismetFeatures.hasOwnProperty( feature ) &&
				pluginsStatus.hasOwnProperty( 'akismet' )
			) {
				status = pluginsStatus.akismet;
			} else if ( completedJetpackFeatures.hasOwnProperty( feature ) ) {
				status = 'done';
			}

			return {
				slug: feature,
				status,
			};
		} );
	}

	getProgress() {
		const features = this.getFeaturesWithStatus();
		if ( ! features.length ) {
			return 0;
		}

		const completed = reduce(
			features,
			( total, feature ) =>
				feature && feature.status && 'done' === feature.status ? total + 1 : total,

			0
		);

		return Math.ceil( ( completed / features.length ) * 100 );
	}

	render() {
		const { site } = this.props;
		if ( ! site || ! site.ID ) {
			return null;
		}
		return (
			<React.Fragment>
				{ site.canUpdateFiles && <QueryPluginKeys siteId={ site.ID } /> }
				<pre>{ JSON.stringify( this.getFeaturesWithStatus(), undefined, 2 ) }</pre>
			</React.Fragment>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const site = getSelectedSite( state );
		const siteId = getSelectedSiteId( state );
		const whitelist = ownProps.whitelist || false;
		let plan = getCurrentPlan( state, siteId );
		let planSlug;
		const planClass = plan && plan.productSlug ? getPlanClass( plan.productSlug ) : '';
		if ( plan ) {
			planSlug = plan.productSlug;
			plan = getPlan( plan.productSlug );
		}
		const planFeatures = plan && plan.getFeatures ? plan.getFeatures() : false;

		// We need to pass the raw redux site to JetpackSite() in order to properly build the site.
		return {
			site,
			wporg: state.plugins.wporg.items,
			isSiteMultiSite: isJetpackSiteMultiSite( state, siteId ),
			isSiteMainNetworkSite: isJetpackSiteMainNetworkSite( state, siteId ),
			isRequesting: isRequesting( state, siteId ),
			hasRequested: hasRequested( state, siteId ),
			isInstalling: isInstalling( state, siteId, whitelist ),
			isFinished: isFinished( state, siteId, whitelist ),
			plugins: getPluginsForSite( state, siteId, whitelist ),
			activePlugin: getActivePlugin( state, siteId, whitelist ),
			nextPlugin: getNextPlugin( state, siteId, whitelist ),
			selectedSite: getSite( state, siteId ),
			isRequestingSites: isRequestingSites( state ),
			siteId,
			jetpackAdminPageUrl: getSiteAdminUrl( state, siteId, 'admin.php?page=jetpack#/plans' ),
			remoteManagementUrl: getJetpackSiteRemoteManagementUrl( state, siteId ),
			planFeatures,
			planClass,
			planSlug,
		};
	},
	{
		fetchPluginData,
		installPlugin,
		requestSites,
	}
)( JetpackPlanSetupRunner );
