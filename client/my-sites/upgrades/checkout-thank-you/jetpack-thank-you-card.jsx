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
	FEATURE_POLLS_PRO,
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

const pdFeatures = {
	[ FEATURE_POLLS_PRO ]: true
};

class JetpackThankYouCard extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			completedJetpackFeatures: []
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
			! site.canUpdateFiles ||
			! site.canManage() ||
			! this.allPluginsHaveWporgData() ||
			this.props.isInstalling
		) {
			return;
		}

		if ( this.props.nextPlugin ) {
			this.startNextPlugin( this.props.nextPlugin );
		} else if (
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
			if ( feature.status ) {
				icon = <Gridicon icon="checkmark" size={ 18 } />;
			} else {
				icon = <Spinner size={ 18 } />;
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
		return ! this.props.hasRequested || this.props.isRequesting;
	}

	isErrored() {
		const { selectedSite } = this.props;
		return selectedSite && ! selectedSite.canUpdateFiles;
	}

	renderFeatures() {
		let mappedFeatures;
		if ( this.shouldRenderPlaceholders() ) {
			mappedFeatures = this.renderFeaturePlaceholders();
		} else {
			mappedFeatures = this.getFeaturesWithStatus().map( this.renderFeature );
		}

		return (
			<ul className="checkout-thank-you__jetpack-features">
				{ mappedFeatures }
			</ul>
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

	activateJetpackFeatures() {
		const { planFeatures } = this.props;
		if ( ! planFeatures ) {
			return false;
		}

		const jetpackFeatures = difference(
			planFeatures,
			Object.keys( vpFeatures ),
			Object.keys( akismetFeatures ),
			Object.keys( pdFeatures )
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
		const { planFeatures, plugins } = this.props;
		const { completedJetpackFeatures } = this.state;
		if ( ! planFeatures ) {
			return false;
		}

		const completedPlugins = reduce( plugins, ( completed, plugin ) => {
			if ( 'done' === plugin.status ) {
				completed[ plugin.slug ] = true;
			}

			return completed;
		}, {} );

		return map( planFeatures, ( feature ) => {
			let status = false;
			if (
				vpFeatures.hasOwnProperty( feature ) && completedPlugins.hasOwnProperty( 'vaultpress' ) ||
				akismetFeatures.hasOwnProperty( feature ) && completedPlugins.hasOwnProperty( 'akismet' ) ||
				pdFeatures.hasOwnProperty( feature ) && completedPlugins.hasOwnProperty( 'polldaddy' ) ||
				completedJetpackFeatures.hasOwnProperty( feature )
			) {
				status = true;
			}

			return {
				slug: feature,
				status
			};
		} );
	}

	renderAction() {
		const features = this.getFeaturesWithStatus() || [ '' ];
		const completed = this.shouldRenderPlaceholders()
			? 0
			: reduce( features, ( total, feature ) => {
				if ( 'object' !== typeof feature || ! feature.hasOwnProperty( 'status' ) || ! feature.status ) {
					return total;
				}

				return total += 1;
			}, 0 );

		if ( completed === features.length ) {
			return null;
		}

		return (
			<ProgressBar value={ completed } total={ features.length } isPulsing />
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
			<div className={ classNames( 'checkout-thank-you__jetpack', this.props.planClass ) }>
				<QueryPluginKeys siteId={ site.ID } />
				{ this.renderErrorNotice() }
				{ turnOnManage && this.renderManageNotice() }
				<PlanThankYouCard siteId={ site.ID } action={ this.renderAction() } />
				{ turnOnManage
					? <FeatureExample>{ this.renderFeatures() }</FeatureExample>
					: this.renderFeatures()
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
