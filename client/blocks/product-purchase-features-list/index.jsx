/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { partial } from 'lodash';

/**
 * Internal dependencies
 */
import { getPlan } from 'lib/plans';
import {
	GROUP_WPCOM,
	GROUP_JETPACK,
	TYPE_ECOMMERCE,
	TYPE_BUSINESS,
	TYPE_PREMIUM,
	TYPE_PERSONAL,
	TYPE_BLOGGER,
	TYPE_FREE,
} from 'lib/plans/constants';
import { PLANS_LIST } from 'lib/plans/plans-list';
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
import GoogleMyBusiness from './google-my-business';
import HappinessSupportCard from './happiness-support-card';
import JetpackAntiSpam from './jetpack-anti-spam';
import JetpackPublicize from './jetpack-publicize';
import JetpackVideo from './jetpack-video';
import JetpackBackupSecurity from './jetpack-backup-security';
import JetpackSearch from './jetpack-search';
import JetpackSiteAccelerator from './jetpack-site-accelerator';
import JetpackReturnToDashboard from './jetpack-return-to-dashboard';
import JetpackWordPressCom from './jetpack-wordpress-com';
import MobileApps from './mobile-apps';
import SellOnlinePaypal from './sell-online-paypal';
import SiteActivity from './site-activity';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import { isEnabled } from 'config';
import { isWordadsInstantActivationEligible } from 'lib/ads/utils';
import { hasDomainCredit } from 'state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'state/ui/selectors';
import { isJetpackMinimumVersion, isJetpackSite } from 'state/sites/selectors';
import { recordTracksEvent } from 'state/analytics/actions';

export class ProductPurchaseFeaturesList extends Component {
	static propTypes = {
		plan: PropTypes.oneOf( Object.keys( PLANS_LIST ) ).isRequired,
		isPlaceholder: PropTypes.bool,
	};

	static defaultProps = {
		isPlaceholder: false,
	};

	// TODO: Define feature list.
	getEcommerceFeatures() {
		const { isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_ecommerce' }
				/>
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<JetpackSearch selectedSite={ selectedSite } />
				<GoogleVouchers selectedSite={ selectedSite } />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<AdvertisingRemoved isBusinessPlan selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				<FindNewTheme selectedSite={ selectedSite } />
				{ isEnabled( 'manage/plugins/upload' ) && <UploadPlugins selectedSite={ selectedSite } /> }
				<SiteActivity />
				<MobileApps />
			</Fragment>
		);
	}

	getBusinessFeatures() {
		const { isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_business' }
				/>
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<BusinessOnboarding
					isWpcomPlan
					onClick={ this.props.recordBusinessOnboardingClick }
					link={ `/me/concierge/${ selectedSite.slug }/book` }
				/>
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				<JetpackSearch selectedSite={ selectedSite } />
				<GoogleVouchers selectedSite={ selectedSite } />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<AdvertisingRemoved isBusinessPlan selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				<FindNewTheme selectedSite={ selectedSite } />
				{ isEnabled( 'manage/plugins/upload' ) && <UploadPlugins selectedSite={ selectedSite } /> }
				<SiteActivity />
				<MobileApps />
				<SellOnlinePaypal isJetpack={ false } />
			</Fragment>
		);
	}

	getPremiumFeatures() {
		const { isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<AdvertisingRemoved isBusinessPlan={ false } selectedSite={ selectedSite } />
				<GoogleVouchers selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				<SiteActivity />
				<MobileApps />
				<SellOnlinePaypal isJetpack={ false } />
			</Fragment>
		);
	}

	getPersonalFeatures() {
		const { isPlaceholder, selectedSite, planHasDomainCredit } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				<AdvertisingRemoved isBusinessPlan selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps />
			</Fragment>
		);
	}

	getBloggerFeatures() {
		const { isPlaceholder, selectedSite, planHasDomainCredit } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				<CustomDomain
					selectedSite={ selectedSite }
					hasDomainCredit={ planHasDomainCredit }
					onlyBlogDomain={ true }
				/>
				<AdvertisingRemoved isBusinessPlan selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps />
			</Fragment>
		);
	}

	getJetpackFreeFeatures() {
		const {
			isAutomatedTransfer,
			isPlaceholder,
			recordReturnToDashboardClick,
			selectedSite,
			supportsJetpackSiteAccelerator,
		} = this.props;
		return (
			<Fragment>
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackWordPressCom selectedSite={ selectedSite } />
				) }
				{ supportsJetpackSiteAccelerator && (
					<JetpackSiteAccelerator selectedSite={ selectedSite } />
				) }
				<SiteActivity />
				<MobileApps />
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackReturnToDashboard
						onClick={ recordReturnToDashboardClick }
						selectedSite={ selectedSite }
					/>
				) }
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isJetpackFreePlan
					isPlaceholder={ isPlaceholder }
				/>
			</Fragment>
		);
	}

	getJetpackPremiumFeatures() {
		const {
			isAutomatedTransfer,
			isPlaceholder,
			recordReturnToDashboardClick,
			selectedSite,
			supportsJetpackSiteAccelerator,
		} = this.props;
		return (
			<Fragment>
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackBackupSecurity /> }
				{ supportsJetpackSiteAccelerator && (
					<JetpackSiteAccelerator selectedSite={ selectedSite } />
				) }
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackAntiSpam selectedSite={ selectedSite } /> }
				<JetpackVideo selectedSite={ selectedSite } />
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackWordPressCom selectedSite={ selectedSite } />
				) }
				<MonetizeSite selectedSite={ selectedSite } />
				<SiteActivity />
				<JetpackPublicize selectedSite={ selectedSite } />
				<MobileApps />
				<SellOnlinePaypal isJetpack />
				{ isEnabled( 'jetpack/concierge-sessions' ) && (
					<BusinessOnboarding
						onClick={ this.props.recordBusinessOnboardingClick }
						link="https://calendly.com/jetpack/concierge"
					/>
				) }
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackReturnToDashboard
						onClick={ recordReturnToDashboardClick }
						selectedSite={ selectedSite }
					/>
				) }
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
				/>
			</Fragment>
		);
	}

	getJetpackPersonalFeatures() {
		const {
			isAutomatedTransfer,
			isPlaceholder,
			recordReturnToDashboardClick,
			selectedSite,
			supportsJetpackSiteAccelerator,
		} = this.props;

		return (
			<Fragment>
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackBackupSecurity /> }
				{ supportsJetpackSiteAccelerator && (
					<JetpackSiteAccelerator selectedSite={ selectedSite } />
				) }
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackAntiSpam selectedSite={ selectedSite } /> }
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackWordPressCom selectedSite={ selectedSite } />
				) }
				<SiteActivity />
				<MobileApps />
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackReturnToDashboard
						onClick={ recordReturnToDashboardClick }
						selectedSite={ selectedSite }
					/>
				) }
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
				/>
			</Fragment>
		);
	}

	getJetpackBusinessFeatures() {
		const {
			isAutomatedTransfer,
			isPlaceholder,
			selectedSite,
			recordReturnToDashboardClick,
			supportsJetpackSiteAccelerator,
		} = this.props;
		return (
			<Fragment>
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackBackupSecurity /> }
				{ supportsJetpackSiteAccelerator && (
					<JetpackSiteAccelerator selectedSite={ selectedSite } />
				) }
				{ ! isEnabled( 'jetpack/checklist' ) && <JetpackAntiSpam selectedSite={ selectedSite } /> }
				<JetpackSearch selectedSite={ selectedSite } />
				<SiteActivity />
				<JetpackVideo selectedSite={ selectedSite } />
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackWordPressCom selectedSite={ selectedSite } />
				) }
				<MonetizeSite selectedSite={ selectedSite } />
				<MobileApps />
				<JetpackPublicize selectedSite={ selectedSite } />
				<SellOnlinePaypal isJetpack />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<FindNewTheme selectedSite={ selectedSite } />

				{ isEnabled( 'jetpack/concierge-sessions' ) && (
					<BusinessOnboarding
						onClick={ this.props.recordBusinessOnboardingClick }
						link="https://calendly.com/jetpack/concierge"
					/>
				) }
				{ ! isEnabled( 'jetpack/checklist' ) && (
					<JetpackReturnToDashboard
						onClick={ recordReturnToDashboardClick }
						selectedSite={ selectedSite }
					/>
				) }
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_jetpack_professsional' }
				/>
			</Fragment>
		);
	}

	getFeatures() {
		const { plan, isPlaceholder } = this.props;

		if ( isPlaceholder ) {
			return null;
		}

		const { group, type } = getPlan( plan );
		const lookup = {
			[ GROUP_WPCOM ]: {
				[ TYPE_ECOMMERCE ]: () => this.getEcommerceFeatures(),
				[ TYPE_BUSINESS ]: () => this.getBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getPersonalFeatures(),
				[ TYPE_BLOGGER ]: () => this.getBloggerFeatures(),
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
			selectedSite,
			planHasDomainCredit: hasDomainCredit( state, selectedSiteId ),
			supportsJetpackSiteAccelerator:
				isJetpackSite( state, selectedSiteId ) &&
				isJetpackMinimumVersion( state, selectedSiteId, '6.7' ),
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
