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
import { getPlan } from 'lib/plans';
import {
	PLANS_LIST,
	GROUP_WPCOM,
	GROUP_JETPACK,
	PLAN_BUSINESS,
	PLAN_JETPACK_BUSINESS,
	PLAN_JETPACK_BUSINESS_MONTHLY,
	PLAN_JETPACK_FREE,
	PLAN_PREMIUM,
	TYPE_BUSINESS,
	TYPE_PREMIUM,
	TYPE_PERSONAL,
	TYPE_FREE,
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
import HappinessSupportCard from './happiness-support-card';
import isHappychatAvailable from 'state/happychat/selectors/is-happychat-available';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackPublicize from './jetpack-publicize';
import JetpackVideo from './jetpack-video';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackSearch from './jetpack-search';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackWordPressCom from './jetpack-wordpress-com';
import { isSiteAutomatedTransfer } from 'state/selectors';
import { isEnabled } from 'config';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
		isPlaceholder: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	getBusinessFeatures() {
		const { isAutomatedTransfer, selectedSite, planHasDomainCredit } = this.props;
		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
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
		const { isAutomatedTransfer, selectedSite, planHasDomainCredit } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
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
		const { isAutomatedTransfer, selectedSite, planHasDomainCredit } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
			<CustomDomain
				selectedSite={ selectedSite }
				hasDomainCredit={ planHasDomainCredit }
				key="customDomainFeature"
			/>,
			<AdvertisingRemoved isBusinessPlan={ false } key="advertisingRemovedFeature" />,
		];
	}

	getJetpackFreeFeatures() {
		const { isAutomatedTransfer, selectedSite } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<JetpackReturnToDashboard
				onClick={ this.props.recordReturnToDashboardClick }
				selectedSite={ selectedSite }
				key="jetpackReturnToDashboard"
			/>,
		];
	}

	getJetpackPremiumFeatures() {
		const { isAutomatedTransfer, selectedSite } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
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
		const { isAutomatedTransfer, selectedSite } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
			<JetpackWordPressCom selectedSite={ selectedSite } key="jetpackWordPressCom" />,
			<JetpackBackupSecurity key="jetpackBackupSecurity" />,
			<JetpackAntiSpam key="jetpackAntiSpam" />,
			<JetpackReturnToDashboard selectedSite={ selectedSite } key="jetpackReturnToDashboard" />,
		];
	}

	getJetpackBusinessFeatures() {
		const { isAutomatedTransfer, liveChatAvailable, selectedSite } = this.props;

		return [
			<HappinessSupportCard
				selectedSite={ selectedSite }
				isFeatureCard={ true }
				isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
				isJetpackFreePlan={ selectedSite.plan.product_slug === PLAN_JETPACK_FREE }
				liveChatAvailable={ liveChatAvailable }
				showLiveChatButton={
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS ||
					selectedSite.plan.product_slug === PLAN_JETPACK_BUSINESS_MONTHLY
				}
			/>,
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

		const { group, type } = getPlan( plan );
		const lookup = {
			[ GROUP_WPCOM ]: {
				[ TYPE_BUSINESS ]: () => this.getBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getPersonalFeatures(),
			},
			[ GROUP_JETPACK ]: {
				[ TYPE_BUSINESS ]: () => this.getJetpackBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getJetpackPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getJetpackPersonalFeatures(),
				[ TYPE_FREE ]: () => this.getJetpackFreeFeatures(),
			},
		};

		const lookupGroup = lookup[ group ];
		const callback = lookupGroup ? lookupGroup[ type ] : null;
		return callback ? callback() : null;
	}

	render() {
		return <div className="product-purchase-features-list">{ this.getFeatures() }</div>;
	}
}

export default connect(
	state => {
		const selectedSite = getSelectedSite( state ),
			selectedSiteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

		return {
			isAutomatedTransfer,
			liveChatAvailable: isHappychatAvailable( state ),
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
