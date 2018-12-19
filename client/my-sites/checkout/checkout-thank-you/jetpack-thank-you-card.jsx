/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { difference, filter, map, reduce, some } from 'lodash';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';

/**
 * Internal dependencies
 */
import PlanThankYouCard from 'blocks/plan-thank-you-card';
import Notice from 'components/notice';
import NoticeAction from 'components/notice/notice-action';
import QueryPluginKeys from 'components/data/query-plugin-keys';
import analytics from 'lib/analytics';
import { SETTING_UP_PREMIUM_SERVICES } from 'lib/url/support';
import { getSiteFileModDisableReason } from 'lib/site/utils';
import { isCalypsoStartedConnection } from 'jetpack-connect/persistence-utils';
import HappyChatButton from 'components/happychat/button';

// Redux actions & selectors
import { getSelectedSiteId } from 'state/ui/selectors';
import {
	getSite,
	getSiteSlug,
	getSiteAdminUrl,
	isJetpackSiteMainNetworkSite,
	isJetpackSiteMultiSite,
	isRequestingSites,
	getJetpackSiteRemoteManagementUrl,
	isJetpackMinimumVersion,
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
import ProgressBar from 'components/progress-bar';
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
	GROUP_JETPACK,
	TYPE_FREE,
	getPlanClass,
} from 'lib/plans/constants';
import { getPlan, planMatches } from 'lib/plans';

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

export class JetpackThankYouCard extends Component {
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
			! this.shouldRenderPlaceholders() &&
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

	shouldRenderPlaceholders() {
		return ! this.props.planFeatures || ! this.props.hasRequested || this.props.isRequesting;
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

	onHappyChatButtonClick = () => {
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_chat_initiated' );
	};

	onBackToYourSiteClick = () => {
		analytics.tracks.recordEvent( 'calypso_plans_autoconfig_backtoyoursite' );
	};

	isEligibleForLiveChat() {
		const { planSlug } = this.props;
		return (
			planMatches( planSlug, { group: GROUP_JETPACK } ) &&
			! planMatches( planSlug, { type: TYPE_FREE } )
		);
	}

	renderLiveChatButton() {
		const { translate } = this.props;
		const buttonText = this.isErrored()
			? translate( 'Get help setting up' )
			: translate( 'Ask a question' );
		return (
			this.isEligibleForLiveChat() && (
				<HappyChatButton
					borderless={ false }
					className="checkout-thank-you__happychat-button thank-you-card__button"
					onClick={ this.onHappyChatButtonClick }
				>
					{ buttonText }
				</HappyChatButton>
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
				className="checkout-thank-you__jetpack-error-notice"
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
				className="checkout-thank-you__jetpack-manage-notice"
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
		const features = this.getFeaturesWithStatus() || [ '' ];
		const completed = this.shouldRenderPlaceholders()
			? 0
			: reduce(
					features,
					( total, feature ) => {
						if (
							'object' !== typeof feature ||
							! feature.hasOwnProperty( 'status' ) ||
							'done' !== feature.status
						) {
							return total;
						}

						return ( total += 1 );
					},
					0
			  );

		// We're intentionally showing at least 10% progress to indicate that setup has started.
		return Math.max( 10, Math.ceil( ( completed / features.length ) * 100 ) );
	}

	renderAction( progress = 0 ) {
		const { goBackToSiteLink, selectedSite: site, translate } = this.props;
		const buttonUrl = site && goBackToSiteLink;
		// We return instructions for setting up manually
		// when we finish if something errored
		if ( this.isErrored() && ! this.props.isInstalling ) {
			return (
				<div className="checkout-thank-you__jetpack-description-in-actions">
					<p>
						{ translate( 'You will have to {{link}}set up your plan manually{{/link}}.', {
							components: {
								link: <a href={ SETTING_UP_PREMIUM_SERVICES } />,
							},
						} ) }
					</p>
					{ this.renderLiveChatButton() }
				</div>
			);
		}

		if ( 100 === progress ) {
			return (
				<div className="checkout-thank-you__jetpack-action-buttons">
					<a
						className={ classNames( 'button', 'thank-you-card__button', {
							'is-placeholder': ! buttonUrl,
						} ) }
						onClick={ this.onBackToYourSiteClick }
						href={ buttonUrl }
					>
						{ translate( 'Back to your site' ) }
					</a>
					{ this.renderLiveChatButton() }
				</div>
			);
		}

		return <ProgressBar value={ progress } isPulsing />;
	}

	renderDescription( progress = 0 ) {
		const { translate } = this.props;
		const description = translate(
			"Now that we've taken care of the plan, it's time to power up your site."
		);
		if ( 100 === progress ) {
			this.trackConfigFinished( 'calypso_plans_autoconfig_success' );
			return translate( "You are powered up, it's time to see your site." );
		}

		if ( this.isErrored() ) {
			return this.guessErrorReason();
		}

		return description;
	}

	render() {
		const translate = this.props.translate;
		const site = this.props.selectedSite;
		if ( ! site && this.props.isRequestingSites ) {
			return (
				<div className="checkout-thank-you__jetpack">
					<PlanThankYouCard />
				</div>
			);
		}

		const classes = classNames( 'checkout-thank-you__jetpack', this.props.planClass, {
			'is-errored': this.isErrored(),
		} );

		const progress = this.getProgress();

		return (
			<div className={ classes }>
				{ site.canUpdateFiles && <QueryPluginKeys siteId={ site.ID } /> }
				{ this.renderManageNotice() }
				<PlanThankYouCard
					siteId={ site.ID }
					action={ this.renderAction( progress ) }
					heading={
						this.isErrored() && site.canUpdateFiles ? translate( "You're almost there!" ) : null
					}
					description={ this.renderDescription( progress ) }
				/>
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const whitelist = ownProps.whitelist || false;
		let plan = getCurrentPlan( state, siteId );
		let planSlug;
		const planClass = plan && plan.productSlug ? getPlanClass( plan.productSlug ) : '';
		if ( plan ) {
			planSlug = plan.productSlug;
			plan = getPlan( plan.productSlug );
		}
		const planFeatures =
			plan && plan.getPlanCompareFeatures ? plan.getPlanCompareFeatures() : false;
		const jetpackMyPlanPageAvailable = isJetpackMinimumVersion( state, siteId, '6.9-beta' );
		const jetpackAdminPlansPageUrl = jetpackMyPlanPageAvailable
			? 'admin.php?page=jetpack#/my-plan'
			: 'admin.php?page=jetpack#/plans';
		const jetpackAdminPageUrl = getSiteAdminUrl( state, siteId, jetpackAdminPlansPageUrl );
		const goBackToSiteLink = isCalypsoStartedConnection
			? `/plans/my-plan/${ siteSlug }`
			: jetpackAdminPageUrl;

		// We need to pass the raw redux site to JetpackSite() in order to properly build the site.
		return {
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
			remoteManagementUrl: getJetpackSiteRemoteManagementUrl( state, siteId ),
			planFeatures,
			planClass,
			planSlug,
			goBackToSiteLink,
		};
	},
	{
		fetchPluginData,
		installPlugin,
		requestSites,
	}
)( localize( JetpackThankYouCard ) );
