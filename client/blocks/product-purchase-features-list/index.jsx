import { isEnabled } from '@automattic/calypso-config';
import {
	getPlan,
	GROUP_WPCOM,
	GROUP_JETPACK,
	TYPE_ECOMMERCE,
	TYPE_BUSINESS,
	TYPE_PREMIUM,
	TYPE_PERSONAL,
	TYPE_BLOGGER,
	TYPE_FREE,
	PLAN_BUSINESS_2_YEARS,
	PLAN_BUSINESS_ONBOARDING_EXPIRE,
	PLAN_BUSINESS_2Y_ONBOARDING_EXPIRE,
	TYPE_SECURITY_DAILY,
	TYPE_SECURITY_REALTIME,
	TYPE_ALL,
	TERM_MONTHLY,
	getPlans,
	TYPE_PRO,
} from '@automattic/calypso-products';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { isWordadsInstantActivationEligible } from 'calypso/lib/ads/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getConciergeScheduleId from 'calypso/state/selectors/get-concierge-schedule-id';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { hasDomainCredit, getCurrentPlan } from 'calypso/state/sites/plans/selectors';
import { getSelectedSite, getSelectedSiteId } from 'calypso/state/ui/selectors';
import AdvertisingRemoved from './advertising-removed';
import BusinessOnboarding from './business-onboarding';
import CustomCSS from './custom-css';
import CustomDomain from './custom-domain';
import CustomizeTheme from './customize-theme';
import FindNewTheme from './find-new-theme';
import GoogleAnalyticsStats from './google-analytics-stats';
import GoogleMyBusiness from './google-my-business';
import HappinessSupportCard from './happiness-support-card';
import JetpackPublicize from './jetpack-publicize';
import MobileApps from './mobile-apps';
import MonetizeSite from './monetize-site';
import SellOnlinePaypal from './sell-online-paypal';
import SiteActivity from './site-activity';
import UploadPlugins from './upload-plugins';
import VideoAudioPosts from './video-audio-posts';

import './style.scss';

const PLANS_LIST = getPlans();

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
		const { isMonthlyPlan, isPlaceholder, plan, planHasDomainCredit, selectedSite } = this.props;
		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_ecommerce' }
				/>
				{ ! isMonthlyPlan && (
					<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				) }
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<AdvertisingRemoved isEligiblePlan selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isEnabled( 'themes/premium' ) && <FindNewTheme selectedSite={ selectedSite } /> }
				<UploadPlugins selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
			</Fragment>
		);
	}

	getBusinessFeatures() {
		const {
			isPlaceholder,
			isMonthlyPlan,
			plan,
			currentPlan,
			planHasDomainCredit,
			selectedSite,
			scheduleId,
		} = this.props;

		let hasBusinessOnboardingExpired;
		if ( currentPlan ) {
			const expiryDateMoment = this.props.moment( currentPlan.expiryDate );

			const is2YearPlan = plan === PLAN_BUSINESS_2_YEARS;
			const businessOnboardingExpiration = this.props.moment(
				is2YearPlan ? PLAN_BUSINESS_2Y_ONBOARDING_EXPIRE : PLAN_BUSINESS_ONBOARDING_EXPIRE
			);

			hasBusinessOnboardingExpired = businessOnboardingExpiration.diff( expiryDateMoment ) < 0;
		}

		const hasIncludedSessions = scheduleId === 1;
		const hasPurchasedSessions = scheduleId > 1;

		const isBusinessOnboardingAvailable =
			hasPurchasedSessions || ( hasIncludedSessions && ! hasBusinessOnboardingExpired );

		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_business' }
				/>
				{ ! isMonthlyPlan && (
					<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				) }
				{ isBusinessOnboardingAvailable && (
					<BusinessOnboarding
						isWpcomPlan
						onClick={ this.handleBusinessOnboardingClick }
						link={ `/me/quickstart/${ selectedSite.slug }/book` }
					/>
				) }
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<AdvertisingRemoved isEligiblePlan selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<CustomCSS selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isEnabled( 'themes/premium' ) && <FindNewTheme selectedSite={ selectedSite } /> }
				<UploadPlugins selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<SellOnlinePaypal isJetpack={ false } />
			</Fragment>
		);
	}

	getPremiumFeatures() {
		const { isPlaceholder, isMonthlyPlan, plan, planHasDomainCredit, selectedSite } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				{ ! isMonthlyPlan && (
					<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				) }
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<AdvertisingRemoved isEligiblePlan={ false } selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				{ isEnabled( 'themes/premium' ) && <FindNewTheme selectedSite={ selectedSite } /> }
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<SellOnlinePaypal isJetpack={ false } />
			</Fragment>
		);
	}

	getPersonalFeatures() {
		const { isPlaceholder, isMonthlyPlan, selectedSite, planHasDomainCredit } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard isPlaceholder={ isPlaceholder } />
				{ ! isMonthlyPlan && (
					<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				) }
				<AdvertisingRemoved isEligiblePlan selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
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
				<AdvertisingRemoved isEligiblePlan selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
			</Fragment>
		);
	}

	getProFeatuers() {
		const { isPlaceholder, selectedSite, plan, planHasDomainCredit } = this.props;

		return (
			<Fragment>
				<HappinessSupportCard
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_pro' }
				/>
				<CustomDomain selectedSite={ selectedSite } hasDomainCredit={ planHasDomainCredit } />
				{ isWordadsInstantActivationEligible( selectedSite ) && (
					<MonetizeSite selectedSite={ selectedSite } />
				) }
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />
				<AdvertisingRemoved isEligiblePlan selectedSite={ selectedSite } />
				<CustomizeTheme selectedSite={ selectedSite } />
				<CustomCSS selectedSite={ selectedSite } />
				<VideoAudioPosts selectedSite={ selectedSite } plan={ plan } />
				{ isEnabled( 'themes/premium' ) && <FindNewTheme selectedSite={ selectedSite } /> }
				<UploadPlugins selectedSite={ selectedSite } />
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<SellOnlinePaypal isJetpack={ false } />
			</Fragment>
		);
	}

	getJetpackFreeFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isJetpackFreePlan
					isPlaceholder={ isPlaceholder }
				/>
			</Fragment>
		);
	}

	getJetpackPremiumFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<MonetizeSite selectedSite={ selectedSite } />
				<SiteActivity />
				<JetpackPublicize selectedSite={ selectedSite } />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<SellOnlinePaypal isJetpack />
				{ isEnabled( 'jetpack/concierge-sessions' ) && (
					<BusinessOnboarding
						onClick={ this.handleBusinessOnboardingClick }
						link="https://calendly.com/jetpack/concierge"
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
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;

		return (
			<Fragment>
				<SiteActivity />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
				/>
			</Fragment>
		);
	}

	getJetpackBusinessFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<SiteActivity />
				<MonetizeSite selectedSite={ selectedSite } />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<JetpackPublicize selectedSite={ selectedSite } />
				<SellOnlinePaypal isJetpack />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<GoogleMyBusiness selectedSite={ selectedSite } />

				{ isEnabled( 'jetpack/concierge-sessions' ) && (
					<BusinessOnboarding
						onClick={ this.handleBusinessOnboardingClick }
						link="https://calendly.com/jetpack/concierge"
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

	getJetpackSecurityFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<SiteActivity />
				<MonetizeSite selectedSite={ selectedSite } />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<JetpackPublicize selectedSite={ selectedSite } />
				<SellOnlinePaypal isJetpack />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_jetpack_security' }
				/>
			</Fragment>
		);
	}

	getJetpackCompleteFeatures() {
		const { isAutomatedTransfer, isPlaceholder, selectedSite } = this.props;
		return (
			<Fragment>
				<SiteActivity />
				<MonetizeSite selectedSite={ selectedSite } />
				<MobileApps onClick={ this.handleMobileAppsClick } />
				<JetpackPublicize selectedSite={ selectedSite } />
				<SellOnlinePaypal isJetpack />
				<GoogleAnalyticsStats selectedSite={ selectedSite } />
				<HappinessSupportCard
					isJetpack={ !! selectedSite.jetpack && ! isAutomatedTransfer }
					isPlaceholder={ isPlaceholder }
					showLiveChatButton
					liveChatButtonEventName={ 'calypso_livechat_my_plan_jetpack_complete' }
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
				[ TYPE_PRO ]: () => this.getProFeatuers(),
			},
			[ GROUP_JETPACK ]: {
				[ TYPE_BUSINESS ]: () => this.getJetpackBusinessFeatures(),
				[ TYPE_PREMIUM ]: () => this.getJetpackPremiumFeatures(),
				[ TYPE_PERSONAL ]: () => this.getJetpackPersonalFeatures(),
				[ TYPE_FREE ]: () => this.getJetpackFreeFeatures(),
				[ TYPE_SECURITY_DAILY ]: () => this.getJetpackSecurityFeatures(),
				[ TYPE_SECURITY_REALTIME ]: () => this.getJetpackSecurityFeatures(),
				[ TYPE_ALL ]: () => this.getJetpackCompleteFeatures(),
			},
		};

		const lookupGroup = lookup[ group ];
		const callback = lookupGroup ? lookupGroup[ type ] : null;
		return callback ? callback() : null;
	}

	handleBusinessOnboardingClick = () => {
		this.props.recordTracksEvent( 'calypso_plan_features_onboarding_click' );
	};

	handleMobileAppsClick = () => {
		this.props.recordTracksEvent( 'calypso_plan_features_getapps_click' );
	};

	render() {
		return <div className="product-purchase-features-list">{ this.getFeatures() }</div>;
	}
}

export default connect(
	( state, ownProps ) => {
		const selectedSite = getSelectedSite( state );
		const selectedSiteId = getSelectedSiteId( state );
		const isAutomatedTransfer = isSiteAutomatedTransfer( state, selectedSiteId );

		return {
			isAutomatedTransfer,
			selectedSite,
			planHasDomainCredit: hasDomainCredit( state, selectedSiteId ),
			currentPlan: getCurrentPlan( state, selectedSiteId ),
			scheduleId: getConciergeScheduleId( state ),
			isMonthlyPlan: TERM_MONTHLY === getPlan( ownProps.plan )?.term,
		};
	},
	{
		recordTracksEvent,
	}
)( withLocalizedMoment( ProductPurchaseFeaturesList ) );
