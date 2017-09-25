/**
 * External dependencies
 */
import { partial } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import AdvertisingRemoved from './advertising-removed';
import BusinessOnboarding from './business-onboarding';
import CustomDomain from './custom-domain';
import CustomizeTheme from './customize-theme';
import FindNewTheme from './find-new-theme';
import GoogleAnalyticsStats from './google-analytics-stats';
import GoogleVouchers from './google-vouchers';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackPublicize from './jetpack-publicize';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackVideo from './jetpack-video';
import JetpackWordPressCom from './jetpack-wordpress-com';
import MonetizeSite from './monetize-site';
import UploadPlugins from './upload-plugins';
import VideoAudioPosts from './video-audio-posts';
import { isEnabled } from 'config';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { PLAN_FREE, PLAN_PERSONAL, PLAN_PREMIUM, PLAN_BUSINESS, PLAN_JETPACK_FREE, PLAN_JETPACK_PREMIUM, PLAN_JETPACK_PERSONAL, PLAN_JETPACK_BUSINESS, PLAN_JETPACK_PREMIUM_MONTHLY, PLAN_JETPACK_BUSINESS_MONTHLY, PLAN_JETPACK_PERSONAL_MONTHLY } from 'lib/plans/constants';
import { recordTracksEvent } from 'state/analytics/actions';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';

class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes
			.oneOf( [ PLAN_FREE,
				PLAN_PERSONAL,
				PLAN_PREMIUM,
				PLAN_BUSINESS,
				PLAN_JETPACK_FREE,
				PLAN_JETPACK_BUSINESS,
				PLAN_JETPACK_BUSINESS_MONTHLY,
				PLAN_JETPACK_PREMIUM,
				PLAN_JETPACK_PREMIUM_MONTHLY,
				PLAN_JETPACK_PERSONAL,
				PLAN_JETPACK_PERSONAL_MONTHLY,
				] )
			.isRequired,
		isPlaceholder: PropTypes.bool
	};

	static defaultProps = {
		isPlaceholder: false
	};

	getBusinessFeatures() {
		const {
			selectedSite,
			planHasDomainCredit,
		} = this.props;

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
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
			<BusinessOnboarding
				key="businessOnboarding"
				onClick={ this.props.recordBusinessOnboardingClick }
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
			isEnabled( 'manage/plugins/upload' )
				? <UploadPlugins
					selectedSite={ selectedSite }
					key="uploadPluginsFeature"
				/>
				: null,
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
			planHasDomainCredit
		} = this.props;

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
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
			planHasDomainCredit
		} = this.props;

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
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
			<MonetizeSite
				selectedSite={ selectedSite }
				key="monetizeSiteFeature"
			/>,
			<JetpackBackupSecurity
				key="jetpackBackupSecurity"
			/>,
			<JetpackAntiSpam
				key="jetpackAntiSpam"
			/>,
			<JetpackPublicize
				key="jetpackPublicize"
			/>,
			<JetpackVideo
				key="jetpackVideo"
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

	getJetpackPersonalFeatures() {
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
			<BusinessOnboarding
				key="businessOnboarding"
				onClick={ this.props.recordBusinessOnboardingClick }
			/>,
			<FindNewTheme
				selectedSite={ selectedSite }
				key="findNewThemeFeature"
			/>,
			<JetpackBackupSecurity
				key="jetpackBackupSecurity"
			/>,
			<MonetizeSite
				selectedSite={ selectedSite }
				key="monetizeSiteFeature"
			/>,
			<GoogleAnalyticsStats
				selectedSite={ selectedSite }
				key="googleAnalyticsStatsFeature"
			/>,
			<JetpackAntiSpam
				key="jetpackAntiSpam"
			/>,
			<JetpackPublicize
				key="jetpackPublicize"
			/>,
			<JetpackVideo
				key="jetpackVideo"
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
			case PLAN_JETPACK_PERSONAL:
			case PLAN_JETPACK_PERSONAL_MONTHLY:
				return this.getJetpackPersonalFeatures();
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

export default connect(
	( state ) => {
		const selectedSite = getSelectedSite( state ),
			selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSite,
			planHasDomainCredit: hasDomainCredit( state, selectedSiteId )
		};
	},
	{
		recordBusinessOnboardingClick: partial( recordTracksEvent, 'calypso_plan_features_onboarding_click' )
	}
)( ProductPurchaseFeaturesList );
