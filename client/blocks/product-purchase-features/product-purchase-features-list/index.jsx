/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
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
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackSurveysPolls from './jetpack-surveys-polls';
import JetpackWordPressCom from './jetpack-wordpress-com';
import {
	isPremium as isWpcomPremium,
	isBusiness as isWpcomBusiness
} from 'lib/products-values';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';

export default class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS ] )
			.isRequired,
		selectedSite: PropTypes.object,
		sitePlans: PropTypes.object,
		isPlaceholder: PropTypes.bool
	};

	static defaultProps = {
		isPlaceholder: false
	};

	getBusinessFeatures() {
		const {
			selectedSite,
			sitePlans,
		} = this.props;

		const plan = find( sitePlans.data, isWpcomBusiness );

		return [
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
		} = this.props;

		const plan = find( sitePlans.data, isWpcomPremium );

		return [
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
		} = this.props;

		const plan = find( sitePlans.data, isWpcomPremium );

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ plan && plan.hasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved
				isBusinessPlan={ false }
				key="advertisingRemovedFeature"
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
		const {	selectedSite } = this.props;

		return [
			<JetpackBackupSecurity
				key="jetpackBackupSecurity"
			/>,
			<JetpackAntiSpam
				key="jetpackAntiSpam"
			/>,
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

	getJetpackBusinessFeatures() {
		const {	selectedSite } = this.props;

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

	getFeatures() {
		const { plan, isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return null;
		}

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
			<div className="product-purchase-features-list">
				{ this.getFeatures() }
			</div>
		);
	}
}
