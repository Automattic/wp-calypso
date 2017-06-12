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
import {
	map,
	reduce,
	get,
	difference,
	some
} from 'lodash';

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
import Card from 'components/card';
import utils from 'lib/site/utils';
import FormButtonsBar from 'components/forms/form-buttons-bar';
import FormButton from 'components/forms/form-button';

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
	FEATURES_LIST,
	getPlanClass
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
	[ FEATURE_ONE_CLICK_THREAT_RESOLUTION ]: true
};

const akismetFeatures = {
	[ FEATURE_SPAM_AKISMET_PLUS ]: true
};

class JetpackThankYouCard extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			completedJetpackFeatures: {}
		};
	}

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
		const { plugins } = this.props;

		if ( ! site ||
			! site.jetpack ||
			! site.canManage() ||
			! this.allPluginsHaveWporgData() ||
			this.props.isInstalling
		) {
			return;
		}

		if ( this.props.planFeatures && ! site.canUpdateFiles && ! Object.keys( this.state.completedJetpackFeatures ).length ) {
			this.activateJetpackFeatures();
		}

		if ( site.canUpdateFiles && this.props.nextPlugin ) {
			this.startNextPlugin( this.props.nextPlugin );
		} else if (
			site.canUpdateFiles &&
			plugins &&
			! this.shouldRenderPlaceholders() &&
			! some( plugins, ( plugin ) => 'done' !== plugin.status ) &&
			! Object.keys( this.state.completedJetpackFeatures ).length
		) {
			this.activateJetpackFeatures();
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

	renderFeature( feature, key = 0 ) {
		const description = feature
			? get( FEATURES_LIST, [ feature.slug, 'getTitle' ], () => false )()
			: 'Activating your Jetpack plan';

		if ( false === description ) {
			return null;
		}

		let icon = 'x';
		if ( feature ) {
			switch ( feature.status ) {
				case 'wait':
					icon = <Spinner size={ 18 } />;
					break;
				case 'done':
					icon = <Gridicon icon="checkmark" size={ 18 } />;
					break;
				case 'error':
					icon = <Gridicon icon="notice-outline" size={ 18 } />;
					break;
			}
		}

		const classes = classNames( 'checkout-thank-you__jetpack-feature', {
			'is-placeholder': ! feature
		} );
		return (
			<li key={ key } className={ classes }>
				<span className="checkout-thank-you__jetpack-feature-status-icon">
					{ icon }
				</span>
				<span className="checkout-thank-you__jetpack-feature-status-text">
					{ description }
				</span>
			</li>
		);
	}

	renderFeaturePlaceholders() {
		const placeholderCount = !! this.props.whitelist ? 1 : 2;
		return range( placeholderCount ).map( i => {
			return this.renderFeature( null, i );
		} );
	}

	shouldRenderPlaceholders() {
		return ! this.props.planFeatures || ! this.props.hasRequested || this.props.isRequesting;
	}

	isErrored() {
		const { selectedSite, plugins } = this.props;
		return ( selectedSite && ! selectedSite.canUpdateFiles ) ||
			some( plugins, ( plugin ) => plugin.hasOwnProperty( 'error' ) && plugin.error );
	}

	renderFeatures() {
		const { selectedSite } = this.props;

		const mappedFeatures = ( selectedSite && selectedSite.canUpdateFiles && this.shouldRenderPlaceholders() )
			? this.renderFeaturePlaceholders()
			: this.getFeaturesWithStatus().map( this.renderFeature );
		const features = (
			<ul className="checkout-thank-you__jetpack-features">
				{ mappedFeatures }
			</ul>
		);

		if ( selectedSite && ! selectedSite.canManage() ) {
			return (
				<FeatureExample>
					{ features }
				</FeatureExample>
			);
		}

		return features;
	}

	renderErrorDetail() {
		const { translate, selectedSite } = this.props;
		if ( ! this.isErrored() ) {
			return null;
		}

		const reasons = utils.getSiteFileModDisableReason( selectedSite, 'modifyFiles' );
		let reason;
		if ( reasons && reasons.length > 0 ) {
			reason = translate(
				'We are unable to install the Akismet and VaultPress plugins that power the spam protection, backup, ' +
				"and security features of your Jetpack plan due to your site's current " +
				'file permissions settings. You must either install them manually or change your file permissions.'
			);
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_filemod', { error: reason } );
		} else if ( ! selectedSite.hasMinimumJetpackVersion ) {
			reason = translate(
				'We are unable to install the Akismet and VaultPress plugins that power the spam protection, backup, ' +
				'and security features of your Jetpack plan because your site has an older version of Jetpack. ' +
				'Please upgrade Jetpack and try again.'
			);
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_jpversion', {
				jetpack_version: selectedSite.options.jetpack_version
			} );
		} else if ( ! selectedSite.isMainNetworkSite() ) {
			reason = translate(
				'We are unable to install the Akismet and VaultPress plugins that power the spam protection, backup, ' +
				'and security features of your Jetpack plan because your site is part of a multi-site network, but is not ' +
				'the main network site.'
			);

			this.trackConfigFinished( 'calypso_plans_autoconfig_error_multisite' );
		} else if ( selectedSite.options.is_multi_network ) {
			reason = translate(
					'We are unable to install the Akismet and VaultPress plugins that power the spam protection, backup, ' +
					'and security features of your Jetpack plan because your site is part of a multi-network.'
				);
			this.trackConfigFinished( 'calypso_plans_autoconfig_error_multinetwork' );
		} else {
			const erroredPlugins = reduce( this.props.plugins, ( erroredList, plugin ) => {
				if ( 'error' === plugin.status ) {
					erroredList.push( plugin.slug );
				}
				return erroredList;
			}, [] );

			if ( 1 === erroredPlugins.length && -1 < erroredPlugins.indexOf( 'akismet' ) ) {
				reason = translate(
					'We are unable to automatically configure the Akismet plugin which powers the spam protection feature of ' +
					'your Jetpack plan. Please continue with manual setup or contact ' +
					'support by clicking one of the buttons below.'
				);
			} else if ( 1 === erroredPlugins.length && -1 < erroredPlugins.indexOf( 'vaultpress' ) ) {
				reason = translate(
					'We are unable to automatically configure the VaultPress plugin which powers the security and backup ' +
					'features of your Jetpack plan. Please continue with manual setup or contact ' +
					'support by clicking one of the buttons below.'
				);
			} else {
				reason = translate(
					'We are unable to automatically configure the Akismet and VaultPress plugins that power the spam protection, ' +
					'backup, and security features of your Jetpack plan. Please continue with manual setup or contact ' +
					'support by clicking one of the buttons below.'
				);
			}
			this.trackConfigFinished( 'calypso_plans_autoconfig_error' );
		}

		return (
			<div>
					<Card className="checkout-thank-you__jetpack-error-card">
						<h3 className="checkout-thank-you__jetpack-error-heading">
							{ translate( 'We had trouble setting up your plan' ) }
						</h3>
						<p className="checkout-thank-you__jetpack-error-explanation">
							{ reason }
						</p>
						<FormButtonsBar>
							<FormButton href={ support.JETPACK_CONTACT_SUPPORT }>
								{ translate( 'Get Help' ) }
							</FormButton>

							<FormButton isPrimary={ false } href={ support.SETTING_UP_PREMIUM_SERVICES }>
								{ translate( 'Learn more about manual set up' ) }
							</FormButton>
						</FormButtonsBar>
				</Card>
			</div>
		);
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
			</Notice>
		);
	}

	renderManageNotice() {
		const { translate, selectedSite } = this.props;
		const manageUrl = selectedSite.getRemoteManagementURL() + '&section=plugins-setup';

		if ( ! selectedSite || selectedSite.canManage() ) {
			return null;
		}

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

		const completedJetpackFeatures = reduce( jetpackFeatures, ( completed, feature ) => {
			completed[ feature ] = true;
			return completed;
		}, {} );

		this.setState( {
			completedJetpackFeatures
		} );
	}

	getFeaturesWithStatus() {
		const { planFeatures, selectedSite } = this.props;
		const { completedJetpackFeatures } = this.state;
		if ( ! planFeatures ) {
			return [];
		}

		const plugins = selectedSite && ! selectedSite.canUpdateFiles
			? [
				{ slug: 'vaultpress', status: 'wait', error: true },
				{ slug: 'akismet', status: 'wait', error: true }
			]
			: this.props.plugins;

		const pluginsStatus = reduce( plugins, ( completed, plugin ) => {
			if ( 'done' === plugin.status ) {
				completed[ plugin.slug ] = 'done';
			} else if ( plugin.hasOwnProperty( 'error' ) && plugin.error ) {
				completed[ plugin.slug ] = 'error';
			} else {
				completed[ plugin.slug ] = 'wait';
			}
			return completed;
		}, {} );

		return map( planFeatures, ( feature ) => {
			let status = 'wait';

			if ( vpFeatures.hasOwnProperty( feature ) && pluginsStatus.hasOwnProperty( 'vaultpress' ) ) {
				status = pluginsStatus.vaultpress;
			} else if ( akismetFeatures.hasOwnProperty( feature ) && pluginsStatus.hasOwnProperty( 'akismet' ) ) {
				status = pluginsStatus.akismet;
			} else if ( completedJetpackFeatures.hasOwnProperty( feature ) ) {
				status = 'done';
			}

			return {
				slug: feature,
				status
			};
		} );
	}

	getProgress() {
		if ( this.isErrored() ) {
			return 0;
		}

		const features = this.getFeaturesWithStatus() || [ '' ];
		const completed = this.shouldRenderPlaceholders()
			? 0
			: reduce( features, ( total, feature ) => {
				if ( 'object' !== typeof feature || ! feature.hasOwnProperty( 'status' ) || 'done' !== feature.status ) {
					return total;
				}

				return total += 1;
			}, 0 );

		return Math.ceil( completed / features.length * 100 );
	}

	renderAction( progress = 0 ) {
		// We return an empty span for the error case becaue the default button will be displayed
		// further down the tree if the action is falsey.
		if ( this.isErrored() ) {
			return <span />;
		}

		if ( 100 === progress ) {
			return null;
		}

		return (
			<ProgressBar value={ progress } isPulsing />
		);
	}

	renderDescription( progress = 0 ) {
		const { translate } = this.props;
		if ( 100 === progress ) {
			return translate( "You are powered up, it's time to see your site." );
		}

		return translate( "Now that we've taken care of the plan, it's time to power up your site." );
	}

	render() {
		const site = this.props.selectedSite;
		if ( ! site && this.props.isRequestingSites ) {
			return (
				<div className="checkout-thank-you__jetpack">
					<PlanThankYouCard />
				</div>
			);
		}

		const classes = classNames( 'checkout-thank-you__jetpack', this.props.planClass, {
			'is-errored': this.isErrored()
		} );

		const progress = this.getProgress();

		return (
			<div className={ classes }>
				{ site.canUpdateFiles && <QueryPluginKeys siteId={ site.ID } /> }
				{ this.renderManageNotice() }
				{ this.renderErrorDetail() }
				<PlanThankYouCard
					siteId={ site.ID }
					action={ this.renderAction( progress ) }
					description={ this.renderDescription( progress ) } />
				{ this.renderFeatures() }
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSelectedSite( state );
		const whitelist = ownProps.whitelist || false;
		let plan = getCurrentPlan( state, siteId );
		const planClass = plan && plan.productSlug
			? getPlanClass( plan.productSlug )
			: '';
		if ( plan ) {
			plan = getPlan( plan.productSlug );
		}
		const planFeatures = plan && plan.getFeatures
			? plan.getFeatures()
			: false;

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
			siteId,
			planFeatures,
			planClass
		};
	},
	dispatch => bindActionCreators( { requestSites, fetchPluginData, installPlugin }, dispatch )
)( localize( JetpackThankYouCard ) );
