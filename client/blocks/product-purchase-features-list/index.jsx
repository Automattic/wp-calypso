/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';

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
	PLAN_JETPACK_PERSONAL,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_PREMIUM_MONTHLY,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_PERSONAL_MONTHLY,
} from 'lib/plans/constants';
import FindNewTheme from './find-new-theme';
import UploadPlugins from './upload-plugins';
import AdvertisingRemoved from './advertising-removed';
import GoogleVouchers from './google-vouchers';
import CustomizeTheme from './customize-theme';
import VideoAudioPosts from './video-audio-posts';
import MonetizeSite from './monetize-site';
import BusinessOnboarding from './business-onboarding';
import CustomDomain from './custom-domain';
import GoogleAnalyticsStats from './google-analytics-stats';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackPublicize from './jetpack-publicize';
import JetpackVideo from './jetpack-video';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackSearch from './jetpack-search';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackWordPressCom from './jetpack-wordpress-com';
import { isEnabled } from 'config';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes.oneOf( [
			PLAN_FREE,
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
		] ).isRequired,
		isPlaceholder: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	getBusinessFeatures() {
		const { selectedSite, planHasDomainCredit } = this.props;
		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
				key="customDomainFeature"
			/>,
			<BusinessOnboarding
				key="businessOnboarding"
				onClick={ this.props.recordBusinessOnboardingClick }
				link={ `/me/concierge/${ selectedSite.slug }/book` }
			/>,
			isEnabled( 'manage/plugins/upload' ) ? (
				<UploadPlugins selectedSite={ selectedSite } key="uploadPluginsFeature" />
			) : null,
			isWordadsInstantActivationEligible( selectedSite ) ? (
				<MonetizeSite selectedSite={ selectedSite } key="monetizeSiteFeature" />
			) : null,
			<JetpackSearch selectedSite={ selectedSite } key="jetpackSearch" />,
			<GoogleVouchers selectedSite={ selectedSite } key="googleVouchersFeature" />,
			<GoogleAnalyticsStats selectedSite={ selectedSite } key="googleAnalyticsStatsFeature" />,
			<AdvertisingRemoved isBusinessPlan key="advertisingRemovedFeature" />,
			<CustomizeTheme selectedSite={ selectedSite } key="customizeThemeFeature" />,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
				plan={ PLAN_BUSINESS }
			/>,
			<FindNewTheme selectedSite={ selectedSite } key="findNewThemeFeature" />,
		];
	}

	getPremiumFeatures() {
		const { selectedSite, planHasDomainCredit } = this.props;

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved isBusinessPlan={ false } key="advertisingRemovedFeature" />,
			<GoogleVouchers selectedSite={ selectedSite } key="googleVouchersFeature" />,
			<CustomizeTheme selectedSite={ selectedSite } key="customizeThemeFeature" />,
			<VideoAudioPosts
				selectedSite={ selectedSite }
				key="videoAudioPostsFeature"
				plan={ PLAN_PREMIUM }
			/>,
			isWordadsInstantActivationEligible( selectedSite ) ? (
				<MonetizeSite selectedSite={ selectedSite } key="monetizeSiteFeature" />
			) : null,
		];
	}

	getPersonalFeatures() {
		const { selectedSite, planHasDomainCredit } = this.props;

		return [
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved isBusinessPlan={ false } key="advertisingRemovedFeature" />,
		];
	}

	getJetpackFreeFeatures() {
		const { selectedSite } = this.props;

		return [
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<JetpackReturnToDashboard
				onClick={ this.props.recordReturnToDashboardClick }
				selectedSite={ selectedSite }
				key="jetpackReturnToDashboard"
			/>,
		];
	}

	getJetpackPremiumFeatures() {
		const { selectedSite } = this.props;

		return [
			<MonetizeSite selectedSite={ selectedSite } key="monetizeSiteFeature" />,
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<JetpackBackupSecurity key="jetpackBackupSecurity" />,
			<JetpackAntiSpam key="jetpackAntiSpam" />,
			<JetpackPublicize key="jetpackPublicize" />,
			<JetpackVideo key="jetpackVideo" />,
			<JetpackReturnToDashboard selectedSite={ selectedSite } key="jetpackReturnToDashboard" />,
		];
	}

	getJetpackPersonalFeatures() {
		const { selectedSite } = this.props;

		return [
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<JetpackBackupSecurity key="jetpackBackupSecurity" />,
			<JetpackAntiSpam key="jetpackAntiSpam" />,
			<JetpackReturnToDashboard selectedSite={ selectedSite } key="jetpackReturnToDashboard" />,
		];
	}

	getJetpackBusinessFeatures() {
		const { selectedSite } = this.props;

		return [
			<BusinessOnboarding
				key="businessOnboarding"
				onClick={ this.props.recordBusinessOnboardingClick }
				link="https://calendly.com/jetpack/concierge"
			/>,
			<JetpackSearch selectedSite={ selectedSite } key="jetpackSearch" />,
			<MonetizeSite selectedSite={ selectedSite } key="monetizeSiteFeature" />,
			<GoogleAnalyticsStats selectedSite={ selectedSite } key="googleAnalyticsStatsFeature" />,
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<FindNewTheme selectedSite={ selectedSite } key="findNewThemeFeature" />,
			<JetpackVideo key="jetpackVideo" />,
			<JetpackPublicize key="jetpackPublicize" />,
			<JetpackBackupSecurity key="jetpackBackupSecurity" />,
			<JetpackAntiSpam key="jetpackAntiSpam" />,
			<JetpackReturnToDashboard selectedSite={ selectedSite } key="jetpackReturnToDashboard" />,
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
		return <div className="product-purchase-features-list">{ this.getFeatures() }</div>;
	}
}

export default connect(
	state => {
		const selectedSite = getSelectedSite( state ),
			selectedSiteId = getSelectedSiteId( state );

		return {
			selectedSite,
			planHasDomainCredit: hasDomainCredit( state, selectedSiteId ),
		};
	},
	{
		recordBusinessOnboardingClick: partial(
			recordTracksEvent,
			'calypso_plan_features_onboarding_click',
			{}
		),
		recordReturnToDashboardClick: partial(
			recordTracksEvent,
			'calypso_plan_features_returntodashboard_click',
			{}
		),
	}
)( ProductPurchaseFeaturesList );
