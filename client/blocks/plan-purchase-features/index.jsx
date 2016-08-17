/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import { find } from 'lodash';

/**
 * Internal dependencies
 */
import {
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	PLAN_BUSINESS,
	PLAN_JETPACK_FREE,
	PLAN_JETPACK_PREMIUM,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY
} from 'lib/plans/constants';
import FindNewTheme from './find-new-theme';
import AdvertisingRemoved from './advertising-removed';
import GoogleVouchers from './google-vouchers';
import CustomizeTheme from './customize-theme';
import VideoAudioPosts from './video-audio-posts';
import MonetizeSite from './monetize-site';
import CustomDomain from './custom-domain';
import GoogleAnalyticsStats from './google-analytics-stats';
import HappinessSupport from './happiness-support';
import CurrentPlanHeader from './current-plan-header';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackSurveysPolls from './jetpack-surveys-polls';
import JetpackWordPressCom from './jetpack-wordpress-com';
import { getPlansBySite } from 'state/sites/plans/selectors';
import { getSelectedSite } from 'state/ui/selectors';
import {
	isPremium as isWpcomPremium,
	isBusiness as isWpcomBusiness
} from 'lib/products-values';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';

class PlanPurchaseFeatures extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired,
		selectedSite: PropTypes.object
	};

	getBusinessFeatures() {
		const {
			selectedSite,
			sitePlans,
			translate
		} = this.props;

		const plan = find( sitePlans.data, isWpcomBusiness ),
			hasLoadedFromServer = sitePlans.hasLoadedFromServer;

		return [
			<CurrentPlanHeader
				selectedSite={ selectedSite }
				key="currentPlanHeaderFeature"
				hasLoadedFromServer={ hasLoadedFromServer }
				title={ translate( 'Your site is on a Business plan' ) }
				tagLine={ translate( 'Learn more about everything included with Business and take advantage of' +
					' its professional features.' ) }
			/>,
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchers
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<HappinessSupport
				selectedSite={ selectedSite }
				key="hapinessSupportFeature"
			/>,
			<CustomizeTheme
				selectedSite={ selectedSite }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			<GoogleAnalyticsStats
				selectedSite={ selectedSite }
				key="googleAnalyticsStatsFeature"
			/>,
			<FindNewTheme
				selectedSite={ selectedSite }
				key="findNewThemeFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSite
					selectedSite={ selectedSite }
					key="monetizeSiteFeature"
				/>
				: null
		];
	}

	getPremiumFeatures() {
		const {
			selectedSite,
			sitePlans,
			translate
		} = this.props;

		const plan = find( sitePlans.data, isWpcomPremium ),
			hasLoadedFromServer = sitePlans.hasLoadedFromServer;

		return [
			<CurrentPlanHeader
				selectedSite={ selectedSite }
				key="currentPlanHeaderFeature"
				hasLoadedFromServer={ hasLoadedFromServer }
				title={ translate( 'Your site is on a Business plan' ) }
				tagLine={ translate( 'Learn more about everything included with Business and take advantage of' +
					' its professional features.' ) }
			/>,
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan={ false }
				key="advertisingRemovedFeature"
			/>,
			<GoogleVouchers
				selectedSite={ selectedSite }
				key="googleVouchersFeature"
			/>,
			<HappinessSupport
				selectedSite={ selectedSite }
				key="hapinessSupportFeature"
			/>,
			<CustomizeTheme
				selectedSite={ selectedSite }
				key="customizeThemeFeature"
			/>,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
			/>,
			isWordadsInstantActivationEligible( selectedSite )
				? <MonetizeSite
					selectedSite={ selectedSite }
					key="monetizeSiteFeature"
				/>
				: null
		];
	}

	getPersonalFeatures() {
		const {
			selectedSite,
			sitePlans,
			translate
		} = this.props;

		const plan = find( sitePlans.data, isWpcomPremium ),
			hasLoadedFromServer = sitePlans.hasLoadedFromServer;

		return [
			<CurrentPlanHeader
				selectedSite={ selectedSite }
				key="currentPlanHeaderFeature"
				hasLoadedFromServer={ hasLoadedFromServer }
				title={ translate( 'Your site is on a Business plan' ) }
				tagLine={ translate( 'Learn more about everything included with Business and take advantage of' +
					' its professional features.' ) }
			/>,
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan={ false }
				key="advertisingRemovedFeature"
			/>,
			<HappinessSupport
				selectedSite={ selectedSite }
				key="hapinessSupportFeature"
			/>
		];
	}

	getJetpackFreeFeatures() {
		const {	selectedSite } = this.props;

		return [
			<JetpackWordPressCom
				selectedSite={ selectedSite }
				key="jetpackWordPressCom"
			/>,
			<JetpackReturnToDashboard
				selectedSite={ selectedSite }
				key="jetpackReturnToDashboard"
			/>
		];
	}

	getJetpackPremiumFeatures() {
		return [
			<JetpackBackupSecurity
				key="jetpackBackupSecurity"
			/>,
			<JetpackAntiSpam
				key="jetpackAntiSpam"
			/>,
			this.getJetpackFreeFeatures()
		];
	}

	getJetpackBusinessFeatures() {
		return [
			<JetpackBackupSecurity
				key="jetpackBackupSecurity"
			/>,
			<JetpackAntiSpam
				key="jetpackAntiSpam"
			/>,
			<JetpackSurveysPolls
				key="jetpackSurveysPolls"
			/>,
			this.getJetpackFreeFeatures()
		];
	}

	getPlanPurchaseFeatures() {
		const { plan } = this.props;

		switch ( plan ) {
			case PLAN_BUSINESS:
				return this.getBusinessFeatures();
			case PLAN_PREMIUM:
				return this.getPremiumFeatures();
			case PLAN_PERSONAL:
				return this.getPersonalFeatures();
			case PLAN_JETPACK_FREE:
				return this.getJetpackFreeFeatures();
			case PLAN_JETPACK_PREMIUM:
			case PLAN_JETPACK_PREMIUM_MONTHLY:
				return this.getJetpackPremiumFeatures();
			case PLAN_JETPACK_BUSINESS:
			case PLAN_JETPACK_BUSINESS_MONTHLY:
				return this.getJetpackBusinessFeatures();
			default:
				return null;
		}
	}

	render() {
		return (
			<div className="plan-purchase-features">
				{ this.getPlanPurchaseFeatures() }
			</div>
		);
	}
}

export default connect( ( state, ownProps ) => {
	let selectedSite = getSelectedSite( state );

	if ( ownProps.selectedSite && ! selectedSite ) {
		selectedSite = ownProps.selectedSite;
	}

	return {
		selectedSite,
		sitePlans: getPlansBySite( state, getSelectedSite( state ) )
	};
} )( localize( PlanPurchaseFeatures ) );
